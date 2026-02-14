using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Features.Auth.Commands.Login;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Auth;

public class LoginEndpoint : CoreEndpoint<LoginCommand, AuthResponse>
{

    public LoginEndpoint(IMediator mediator) : base(mediator){}

    public override void Configure()
    {
        Post("/auth/login");
        AllowAnonymous();
        Summary(s =>
        {
            s.Summary = "Login with email and password";
            s.Description = "Authenticates a user and returns access and refresh tokens";
        });
    }

    public override async Task HandleAsync(LoginCommand req, CancellationToken ct)
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
