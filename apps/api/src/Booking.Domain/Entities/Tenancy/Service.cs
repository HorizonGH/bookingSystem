namespace Booking.Domain.Entities.Tenancy;

public class Service : Idendity.Entity
{
    public Guid TenantId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    
    // Buffer times
    public int BufferTimeBefore { get; set; } = 0;
    public int BufferTimeAfter { get; set; } = 0;
    
    // Booking settings
    public bool RequiresApproval { get; set; } = false;
    public int MaxAdvanceBookingDays { get; set; } = 30;
    public int MinAdvanceBookingHours { get; set; } = 1;
    
    // Navigation Properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<WorkerService> WorkerServices { get; set; } = new List<WorkerService>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
