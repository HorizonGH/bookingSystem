using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Features.Auth.Commands.RegisterSaasTenant;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Auth;

public class RegisterSaasTenantEndpoint : CoreEndpoint<RegisterSaasTenantCommand, AuthResponse>
{
    public RegisterSaasTenantEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/auth/register-tenant");
        AllowAnonymous();
        Summary(s =>
        {
            s.Summary = "Register a new SaaS tenant account";
            s.Description = "Creates a new tenant business and registers the owner as a TenantAdmin user, returning authentication tokens";
        });
    }

    public override async Task HandleAsync(RegisterSaasTenantCommand req, CancellationToken ct)
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