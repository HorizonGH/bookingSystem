using Booking.Domain.Entities.Idendity;

namespace Booking.Domain.Entities.Tenancy;

public class Tenant : Idendity.Entity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty; // URL-friendly identifier
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    
    // Business Hours (JSON or separate table)
    public string? BusinessHours { get; set; }
    
    // Default Schedule Constraints for Workers
    public TimeSpan DefaultScheduleStartTime { get; set; } = new TimeSpan(9, 0, 0); // 9:00 AM
    public TimeSpan DefaultScheduleEndTime { get; set; } = new TimeSpan(18, 0, 0); // 6:00 PM
    public string AllowedScheduleDays { get; set; } = "1,2,3,4,5,6"; // Monday-Saturday (0=Sunday, 6=Saturday)
    
    // Navigation Properties
    public ICollection<TenantPlan> TenantPlans { get; set; } = new List<TenantPlan>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Worker> Workers { get; set; } = new List<Worker>();
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
