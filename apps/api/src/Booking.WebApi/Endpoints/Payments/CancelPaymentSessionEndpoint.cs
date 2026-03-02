using Booking.Application.Features.Payments.Commands.CancelPaymentSession;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class CancelPaymentSessionEndpoint : CoreEndpoint<CancelPaymentSessionCommand>
{
    public CancelPaymentSessionEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Delete("/tenants/{tenantId}/payments/sessions/{sessionId}");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Cancel a payment session")
            .WithDescription("Cancels an active payment session that is awaiting payment, allowing the tenant to start a new one. Sessions already under review cannot be cancelled.")
            .Produces(204)
            .ProducesProblem(400));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(CancelPaymentSessionCommand req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(req, ct);
            HttpContext.Response.StatusCode = 204;
        }
        catch (KeyNotFoundException ex)
        {
            // session not present -> 404 rather than generic bad request
            ThrowError(ex.Message, 404);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
