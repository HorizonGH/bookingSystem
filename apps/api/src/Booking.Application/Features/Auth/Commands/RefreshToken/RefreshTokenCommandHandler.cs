using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IAuthService _authService;

    public RefreshTokenCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var refreshRequest = new RefreshTokenRequest(request.AccessToken, request.RefreshToken);
        var result = await _authService.RefreshTokenAsync(refreshRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            throw new UnauthorizedAccessException(result.Error ?? "Invalid refresh token");
        }

        return result.Data!;
    }
}
