namespace Booking.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    string? Email { get; }
    IEnumerable<string> Roles { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }
    bool IsTenantAdmin { get; }
}
