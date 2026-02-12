using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Tenancy;

public class Plan : Idendity.Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PlanType PlanType { get; set; }
    public decimal Price { get; set; }
    public string BillingCycle { get; set; } = "Monthly"; // Monthly, Yearly
    
    // Plan Features
    public int MaxWorkers { get; set; }
    public int MaxServices { get; set; }
    public int MaxReservationsPerMonth { get; set; }
    public bool HasCustomBranding { get; set; }
    public bool HasAnalytics { get; set; }
    public bool HasApiAccess { get; set; }
    
    // Navigation Properties
    public ICollection<TenantPlan> TenantPlans { get; set; } = new List<TenantPlan>();
}
