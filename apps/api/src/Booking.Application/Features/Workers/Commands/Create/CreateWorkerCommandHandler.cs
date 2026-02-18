using Booking.Application.Common.Constants;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Workers.Commands.Create;

public class CreateWorkerCommandHandler : IRequestHandler<CreateWorkerCommand, WorkerDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateWorkerCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkerDto> Handle(CreateWorkerCommand request, CancellationToken cancellationToken)
    {
        // Use tenantId provided by the caller (TenantAdmin) — the user being added may not have a TenantId
        var tenantId = request.TenantId;
        if (tenantId == Guid.Empty)
            throw new InvalidOperationException("TenantId is required");

        // Ensure the tenant exists
        var tenantRepo = _unitOfWork.ReadRepository<Domain.Entities.Tenancy.Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(tenantId);
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found");

        // Get user to validate it exists
        var userRepo = _unitOfWork.ReadRepository<Domain.Entities.Idendity.User>();
        var user = await userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            throw new InvalidOperationException("User not found");

        // If the user already belongs to a different tenant, disallow linking
        if (user.TenantId.HasValue && user.TenantId.Value != tenantId)
            throw new InvalidOperationException("User already belongs to another tenant");

        // Check if user is already a worker
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var existingWorker = await workerRepo
            .GetAll()
            .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.TenantId == tenantId, cancellationToken);

        if (existingWorker != null)
            throw new InvalidOperationException("User is already a worker for this tenant");

        // Get tenant plan to check limits
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(tp => tp.TenantId == tenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan == null)
            throw new InvalidOperationException("Tenant does not have an active plan");

        // Validate worker limit
        var currentWorkers = tenantPlan.CurrentWorkers;
        var planType = tenantPlan.Plan.PlanType;

        if (!PlanLimits.CanAddWorkers(planType, currentWorkers))
        {
            var maxWorkers = PlanLimits.GetMaxWorkers(planType);
            throw new InvalidOperationException(
                $"Worker limit reached. Your {planType} plan allows a maximum of {maxWorkers} worker(s). " +
                $"Please upgrade your plan to add more workers.");
        }

        // Create worker
        var worker = new Worker
        {
            UserId = request.UserId,
            TenantId = tenantId,
            JobTitle = request.JobTitle,
            Bio = request.Bio,
            ProfileImageUrl = request.ProfileImageUrl,
            IsAvailableForBooking = request.IsAvailableForBooking,
            Created = DateTime.UtcNow
        };

        var writeRepo = _unitOfWork.WriteRepository<Worker>();
        await writeRepo.AddAsync(worker);

        // Update worker count
        tenantPlan.CurrentWorkers++;
        var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();
        tenantPlanWriteRepo.Update(tenantPlan);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load user relationship
        worker.User = user;

        return WorkerMapper.ToDto(worker);
    }
}
