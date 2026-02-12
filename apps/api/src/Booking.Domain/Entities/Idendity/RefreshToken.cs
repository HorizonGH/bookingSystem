namespace Booking.Domain.Entities.Idendity;

public class RefreshToken : Entity
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public string? ReplacedByToken { get; set; }
    
    // Foreign Keys
    public Guid UserId { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
}
