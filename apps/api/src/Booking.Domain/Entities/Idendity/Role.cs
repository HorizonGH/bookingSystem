using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Idendity;

public class Role : Entity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public RoleType RoleType { get; set; }
    
    // Navigation Properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
