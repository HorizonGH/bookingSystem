using Booking.Application.Common.Interfaces;
using Booking.Application.Features.Auth.Commands.Logout;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Auth;

public class LogoutEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUser;

    public LogoutEndpoint(IMediator mediator, ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _currentUser = currentUser;
    }

    public override void Configure()
    {
        Post("/auth/logout");
        Summary(s =>
        {
            s.Summary = "Logout current user";
            s.Description = "Revokes all refresh tokens for the authenticated user";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (!_currentUser.UserId.HasValue)
        {
            ThrowError("User not authenticated", 401);
        }

        try
        {
            var command = new LogoutCommand(_currentUser.UserId!.Value);
            await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 204;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
