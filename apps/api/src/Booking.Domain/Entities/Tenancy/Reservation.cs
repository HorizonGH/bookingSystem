using Booking.Domain.Entities.Idendity;
using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Tenancy;

public class Reservation : Idendity.Entity
{
    public Guid TenantId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid WorkerId { get; set; }
    public Guid ClientId { get; set; }
    
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ReservationStatus ReservationStatus { get; set; } = ReservationStatus.Pending;
    
    // Client Information (can be different from User if guest booking)
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    
    // Booking details
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
    
    // Notifications
    public bool ReminderSent { get; set; } = false;
    public bool ConfirmationSent { get; set; } = false;
    
    // Navigation Properties
    public Tenant Tenant { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public Worker Worker { get; set; } = null!;
    public User Client { get; set; } = null!;
}
