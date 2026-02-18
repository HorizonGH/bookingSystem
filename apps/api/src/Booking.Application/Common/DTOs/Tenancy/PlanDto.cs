using System;
using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Tenancy;

public class PlanDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PlanType PlanType { get; set; }
    public decimal Price { get; set; }
    public string BillingCycle { get; set; } = "Monthly";

    // Features
    public int MaxWorkers { get; set; }
    public int MaxServices { get; set; }
    public int MaxReservationsPerMonth { get; set; }
    public bool HasCustomBranding { get; set; }
    public bool HasAnalytics { get; set; }
    public bool HasApiAccess { get; set; }

    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
}