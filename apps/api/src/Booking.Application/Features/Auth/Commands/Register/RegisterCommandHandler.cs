using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly IAuthService _authService;

    public RegisterCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var registerRequest = new RegisterRequest(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Password,
            request.PhoneNumber
        );

        var result = await _authService.RegisterAsync(registerRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            throw new InvalidOperationException(result.Error ?? "Registration failed");
        }

        return result.Data!;
    }
}
