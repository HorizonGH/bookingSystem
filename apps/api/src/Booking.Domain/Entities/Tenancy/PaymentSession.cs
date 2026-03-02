using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Tenancy;

public class PaymentSession : Idendity.Entity
{
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    
    public decimal ExpectedAmount { get; set; }
    public PaymentCurrency Currency { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentSessionStatus Status { get; set; } = PaymentSessionStatus.WaitingPayment;
    
    /// <summary>
    /// Auto-generated reference code for Zelle payments (e.g., PRO-48291).
    /// Null for Transfermóvil since it doesn't support memo references.
    /// </summary>
    public string? ReferenceCode { get; set; }
    
    public DateTime ExpiresAt { get; set; }
    
    // Navigation Properties
    public Tenant Tenant { get; set; } = null!;
    public Plan Plan { get; set; } = null!;
    public Payment? Payment { get; set; }
}
