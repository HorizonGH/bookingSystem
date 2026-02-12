using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using FastEndpoints;

namespace Booking.WebApi.Endpoints.Auth;

public class MeEndpoint : EndpointWithoutRequest<UserDto>
{
    private readonly ICurrentUserService _currentUser;

    public MeEndpoint(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Get("/auth/me");
        Summary(s =>
        {
            s.Summary = "Get current user information";
            s.Description = "Returns information about the authenticated user";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!_currentUser.IsAuthenticated || !_currentUser.UserId.HasValue)
        {
            ThrowError("User not authenticated", 401);
        }

        Response = new UserDto(
            _currentUser.UserId!.Value,
            string.Empty,
            string.Empty,
            _currentUser.Email ?? string.Empty,
            string.Empty,
            _currentUser.TenantId,
            false,
            _currentUser.Roles.ToList()
        );
    }
}
