using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Application.Common.Mappers;

public static class PlanMapper
{
    public static PlanDto ToDto(Plan p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        PlanType = p.PlanType,
        Price = p.Price,
        BillingCycle = p.BillingCycle,
        MaxWorkers = p.MaxWorkers,
        MaxServices = p.MaxServices,
        MaxReservationsPerMonth = p.MaxReservationsPerMonth,
        HasCustomBranding = p.HasCustomBranding,
        HasAnalytics = p.HasAnalytics,
        HasApiAccess = p.HasApiAccess,
        Created = p.Created,
        LastModified = p.LastModified
    };
}