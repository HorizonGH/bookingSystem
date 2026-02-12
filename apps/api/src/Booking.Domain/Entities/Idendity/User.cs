using System;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Domain.Entities.Idendity;

public class User : Entity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    // Only for TenantAdmin who manages a specific tenant
    // null for: SuperAdmin (system-wide), Clients (can book at any tenant), Workers (use Worker.TenantId instead)
    public Guid? TenantId { get; set; }
    
    // Account Status
    public bool IsEmailVerified { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation Properties
    public Tenant? Tenant { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
