using Booking.Domain.Entities.Idendity;

namespace Booking.Application.Common.Interfaces;

public interface ITokenService
{
    Task<RefreshToken> CreateRefreshTokenAsync(Guid userId, string token, CancellationToken cancellationToken = default);
    Task<RefreshToken?> GetRefreshTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<bool> ValidateRefreshTokenAsync(string token, CancellationToken cancellationToken = default);
    Task RevokeRefreshTokenAsync(string token, string? replacedByToken = null, CancellationToken cancellationToken = default);
    Task RevokeAllUserTokensAsync(Guid userId, CancellationToken cancellationToken = default);
    Task CleanupExpiredTokensAsync(CancellationToken cancellationToken = default);
}
