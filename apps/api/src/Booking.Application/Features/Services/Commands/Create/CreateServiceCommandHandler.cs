using Booking.Application.Common.Constants;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Services.Commands.Create;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, ServiceDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceDto> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        var tenantId = request.TenantId;
        if (tenantId == Guid.Empty)
            throw new InvalidOperationException("TenantId is required");

        var tenantRepo = _unitOfWork.ReadRepository<Domain.Entities.Tenancy.Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(tenantId);
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found");

        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(tp => tp.TenantId == tenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan == null)
            throw new InvalidOperationException("Tenant does not have an active plan");

        var planType = tenantPlan.Plan.PlanType;
        var currentServices = tenantPlan.CurrentServices;

        if (!PlanLimits.CanAddServices(planType, currentServices))
        {
            var maxServices = PlanLimits.GetMaxServices(planType);
            throw new InvalidOperationException(
                $"Service limit reached. Your {planType} plan allows a maximum of {maxServices} service(s). Please upgrade your plan to add more services.");
        }

        var service = new Service
        {
            TenantId = tenantId,
            Name = req.Name,
            Description = req.Description,
            DurationMinutes = req.DurationMinutes,
            Price = req.Price,
            ImageUrl = req.ImageUrl,
            Category = req.Category,
            BufferTimeBefore = req.BufferTimeBefore,
            BufferTimeAfter = req.BufferTimeAfter,
            RequiresApproval = req.RequiresApproval,
            MaxAdvanceBookingDays = req.MaxAdvanceBookingDays,
            MinAdvanceBookingHours = req.MinAdvanceBookingHours,
            Created = DateTime.UtcNow
        };

        var writeRepo = _unitOfWork.WriteRepository<Service>();
        await writeRepo.AddAsync(service);

        // update tenant plan service count
        tenantPlan.CurrentServices++;
        var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();
        tenantPlanWriteRepo.Update(tenantPlan);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ServiceMapper.ToDto(service);
    }
}