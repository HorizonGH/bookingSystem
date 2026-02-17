using Booking.Application.Common.Constants;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Services.Queries.GetByTenant;

public class GetServicesByTenantQueryHandler : IRequestHandler<GetServicesByTenantQuery, ServicesByTenantResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetServicesByTenantQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServicesByTenantResponse> Handle(GetServicesByTenantQuery request, CancellationToken cancellationToken)
    {
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(tp => tp.TenantId == request.TenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan == null)
            throw new InvalidOperationException("Tenant does not have an active plan");

        var serviceRepo = _unitOfWork.ReadRepository<Service>();
        var services = await serviceRepo
            .GetAll()
            .Where(s => s.TenantId == request.TenantId)
            .OrderBy(s => s.Created)
            .ToListAsync(cancellationToken);

        var planType = tenantPlan.Plan.PlanType;
        var maxServices = PlanLimits.GetMaxServices(planType);

        return new ServicesByTenantResponse
        {
            Services = services.Select(ServiceMapper.ToDto).ToList(),
            PlanType = planType,
            MaxServices = maxServices,
            CurrentServices = tenantPlan.CurrentServices
        };
    }
}