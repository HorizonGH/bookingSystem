using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Features.Payments.Queries.GetActivePaymentSession;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class GetActivePaymentSessionEndpoint : CoreEndpoint<GetActivePaymentSessionQuery, PaymentSessionDto?>
{
    public GetActivePaymentSessionEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/payments/sessions/active");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Get active payment session")
            .WithDescription("Returns the current active payment session for a tenant (status WaitingPayment or WaitingReview). Returns null if no active session exists.")
            .Produces<PaymentSessionDto>(200)
            .Produces(204));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(GetActivePaymentSessionQuery req, CancellationToken ct)
    {
        var result = await _mediator.Send(req, ct);

        if (result == null)
        {
            HttpContext.Response.StatusCode = 204;
            return;
        }

        Response = result;
    }
}
