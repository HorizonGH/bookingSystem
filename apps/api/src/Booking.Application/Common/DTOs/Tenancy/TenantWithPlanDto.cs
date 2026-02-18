using System;
using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Tenancy;

public record TenantPlanInfoDto
{
    public Guid Id { get; init; }
    public Guid PlanId { get; init; }
    public string PlanName { get; init; } = string.Empty;
    public PlanType PlanType { get; init; }
    public SubscriptionStatus SubscriptionStatus { get; init; }

    // Billing
    public DateTime? TrialEndsAt { get; init; }
    public DateTime? NextBillingDate { get; init; }
    public decimal CurrentPrice { get; init; }

    // Usage
    public int CurrentWorkers { get; init; }
    public int CurrentServices { get; init; }
    public int ReservationsThisMonth { get; init; }

    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }

    // Include plan definition if needed
    public Guid? PlanDefinitionId { get; init; }
    public string? PlanDefinitionName { get; init; }
}

public record TenantWithPlanDto
{
    public TenantDto Tenant { get; init; } = null!;
    public TenantPlanInfoDto? Plan { get; init; }
}