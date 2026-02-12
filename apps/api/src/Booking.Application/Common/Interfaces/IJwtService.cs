using System.Security.Claims;
using Booking.Domain.Entities.Idendity;

namespace Booking.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user, IEnumerable<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token, bool validateLifetime = true);
    Guid? GetUserIdFromToken(string token);
}
