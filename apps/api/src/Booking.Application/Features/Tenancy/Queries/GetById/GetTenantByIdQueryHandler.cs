using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Features.Tenancy.Queries;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Tenancy.Queries.GetById;

public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, TenantWithPlanDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    public GetTenantByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantWithPlanDto?> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(request.Id);
        
        if (tenant == null)
        {
            return null;
        }

        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tp = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(x => x.TenantId == tenant.Id)
            .OrderByDescending(x => x.Created)
            .FirstOrDefaultAsync(cancellationToken);

        return new TenantWithPlanDto
        {
            Tenant = MapToDto(tenant),
            Plan = tp == null ? null : new TenantPlanInfoDto
            {
                Id = tp.Id,
                PlanId = tp.PlanId,
                PlanName = tp.Plan?.Name ?? string.Empty,
                PlanType = tp.Plan?.PlanType ?? default,
                SubscriptionStatus = tp.SubscriptionStatus,
                TrialEndsAt = tp.TrialEndsAt,
                NextBillingDate = tp.NextBillingDate,
                CurrentPrice = tp.CurrentPrice,
                CurrentWorkers = tp.CurrentWorkers,
                CurrentServices = tp.CurrentServices,
                ReservationsThisMonth = tp.ReservationsThisMonth,
                StartDate = tp.StartDate,
                EndDate = tp.EndDate,
                PlanDefinitionId = tp.Plan?.Id,
                PlanDefinitionName = tp.Plan?.Name
            }
        };
    }

    private static TenantDto MapToDto(Tenant tenant)
    {
        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Slug = tenant.Slug,
            Description = tenant.Description,
            LogoUrl = tenant.LogoUrl,
            Website = tenant.Website,
            Email = tenant.Email,
            PhoneNumber = tenant.PhoneNumber,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            Country = tenant.Country,
            PostalCode = tenant.PostalCode,
            BusinessHours = tenant.BusinessHours,
            Created = tenant.Created,
            LastModified = tenant.LastModified
        };
    }
}