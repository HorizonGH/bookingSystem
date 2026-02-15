using Booking.Application.Common.Constants;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Workers.Queries.GetByTenant;

public class GetWorkersByTenantQueryHandler : IRequestHandler<GetWorkersByTenantQuery, WorkersByTenantResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetWorkersByTenantQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkersByTenantResponse> Handle(GetWorkersByTenantQuery request, CancellationToken cancellationToken)
    {
        // Get tenant plan to check limits
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(tp => tp.TenantId == request.TenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan == null)
            throw new InvalidOperationException("Tenant does not have an active plan");

        // Get all available workers for this tenant
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var workers = await workerRepo
            .GetAll([w => w.User])
            .Where(w => w.TenantId == request.TenantId && w.IsAvailableForBooking)
            .OrderBy(w => w.Created)
            .ToListAsync(cancellationToken);

        var planType = tenantPlan.Plan.PlanType;
        var maxWorkers = PlanLimits.GetMaxWorkers(planType);

        return new WorkersByTenantResponse
        {
            Workers = workers.Select(WorkerMapper.ToDto).ToList(),
            PlanType = planType,
            IsSingleWorkerOnly = planType == Domain.Enums.PlanType.Free && workers.Count == 1,
            MaxWorkers = maxWorkers,
            CurrentWorkers = tenantPlan.CurrentWorkers
        };
    }
}
