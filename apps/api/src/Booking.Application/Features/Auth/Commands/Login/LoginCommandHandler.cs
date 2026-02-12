using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var loginRequest = new LoginRequest(request.Email, request.Password);
        var result = await _authService.LoginAsync(loginRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            throw new UnauthorizedAccessException(result.Error ?? "Invalid credentials");
        }

        return result.Data!;
    }
}
