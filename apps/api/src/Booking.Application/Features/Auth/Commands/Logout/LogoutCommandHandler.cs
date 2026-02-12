using Booking.Application.Common.Interfaces;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IAuthService _authService;

    public LogoutCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var result = await _authService.LogoutAsync(request.UserId, cancellationToken);

        if (!result.IsSuccess)
        {
            throw new InvalidOperationException(result.Error ?? "Logout failed");
        }
    }
}
