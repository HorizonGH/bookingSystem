using Booking.Domain.Entities.Idendity;

namespace Booking.Domain.Entities.Tenancy;

public class Worker : Idendity.Entity
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    
    public string? JobTitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsAvailableForBooking { get; set; } = true;
    
    // Navigation Properties
    public User User { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
    public ICollection<WorkerService> WorkerServices { get; set; } = new List<WorkerService>();
    public ICollection<WorkerSchedule> WorkerSchedules { get; set; } = new List<WorkerSchedule>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
