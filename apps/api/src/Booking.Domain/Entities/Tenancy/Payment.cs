using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Tenancy;

public class Payment : Idendity.Entity
{
    public Guid PaymentSessionId { get; set; }
    public Guid TenantId { get; set; }
    
    public decimal Amount { get; set; }
    public PaymentCurrency Currency { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    
    // Proof of payment fields
    public string SenderName { get; set; } = string.Empty;
    public string ScreenshotUrl { get; set; } = string.Empty;
    public string ScreenshotPublicId { get; set; } = string.Empty;
    
    /// <summary>
    /// Transaction number for Transfermóvil payments.
    /// </summary>
    public string? TransactionNumber { get; set; }
    
    /// <summary>
    /// Confirmation number for Zelle payments.
    /// </summary>
    public string? ConfirmationNumber { get; set; }
    
    /// <summary>
    /// The date/time the user claims the transfer was made.
    /// </summary>
    public DateTime TransferTime { get; set; }
    
    /// <summary>
    /// Admin notes when reviewing the payment.
    /// </summary>
    public string? AdminNotes { get; set; }
    
    /// <summary>
    /// When the payment was reviewed by admin.
    /// </summary>
    public DateTime? ReviewedAt { get; set; }
    
    /// <summary>
    /// Admin user who reviewed the payment.
    /// </summary>
    public Guid? ReviewedByUserId { get; set; }
    
    // Navigation Properties
    public PaymentSession PaymentSession { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
