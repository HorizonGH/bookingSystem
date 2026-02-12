using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Tenancy;

public class TenantPlan : Idendity.Entity
{
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public SubscriptionStatus SubscriptionStatus { get; set; }
    
    // Billing
    public DateTime? TrialEndsAt { get; set; }
    public DateTime? NextBillingDate { get; set; }
    public decimal CurrentPrice { get; set; }
    
    // Usage Tracking
    public int CurrentWorkers { get; set; }
    public int CurrentServices { get; set; }
    public int ReservationsThisMonth { get; set; }
    
    // Navigation Properties
    public Tenant Tenant { get; set; } = null!;
    public Plan Plan { get; set; } = null!;
}
