using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Features.Auth.Commands.Register;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Auth;

public class RegisterEndpoint : CoreEndpoint<RegisterCommand, AuthResponse>
{
    public RegisterEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/auth/register");
        AllowAnonymous();
        Summary(s =>
        {
            s.Summary = "Register a new user account";
            s.Description = "Creates a new user with Client role and returns authentication tokens";
        });
    }

    public override async Task HandleAsync(RegisterCommand req, CancellationToken ct)
    {
        try
        {
            Response = await _mediator.Send(req, ct);
            HttpContext.Response.StatusCode = 201;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
