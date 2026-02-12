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
    
    // Navigation Properties
    public ICollection<TenantPlan> TenantPlans { get; set; } = new List<TenantPlan>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Worker> Workers { get; set; } = new List<Worker>();
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
