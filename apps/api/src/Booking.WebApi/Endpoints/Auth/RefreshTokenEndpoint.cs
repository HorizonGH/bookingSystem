using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Features.Auth.Commands.RefreshToken;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Auth;

public class RefreshTokenEndpoint : Endpoint<RefreshTokenCommand, AuthResponse>
{
    private readonly IMediator _mediator;

    public RefreshTokenEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/auth/refresh");
        AllowAnonymous();
        Summary(s =>
        {
            s.Summary = "Refresh access token";
            s.Description = "Exchanges an expired access token and valid refresh token for new tokens";
        });
    }

    public override async Task HandleAsync(RefreshTokenCommand req, CancellationToken ct)
    {
        try
        {
            Response = await _mediator.Send(req, ct);
        }
        catch (UnauthorizedAccessException ex)
        {
            ThrowError(ex.Message, 401);
        }
    }
}
