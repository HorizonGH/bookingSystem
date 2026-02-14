using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.RegisterSaasTenant;

public class RegisterSaasTenantCommandHandler : IRequestHandler<RegisterSaasTenantCommand, AuthResponse>
{
    private readonly IAuthService _authService;

    public RegisterSaasTenantCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(RegisterSaasTenantCommand request, CancellationToken cancellationToken)
    {
        var registerRequest = new RegisterSaasTenantRequest
        {
            UserRequest = request.UserRequest,
            TenantRequest = request.TenantRequest
        };

        var result = await _authService.RegisterSaasTenantAsync(registerRequest, cancellationToken);

        if (!result.IsSuccess)
        {
            throw new InvalidOperationException(result.Error ?? "SaaS tenant registration failed");
        }

        return result.Data!;
    }
}