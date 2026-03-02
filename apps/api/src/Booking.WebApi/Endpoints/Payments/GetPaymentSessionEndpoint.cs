using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Features.Payments.Queries.GetPaymentSession;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class GetPaymentSessionEndpoint : CoreEndpoint<GetPaymentSessionQuery, PaymentSessionDto>
{
    public GetPaymentSessionEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/payments/sessions/{sessionId}");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Get payment session details")
            .WithDescription("Returns the details of a specific payment session including status and instructions.")
            .Produces<PaymentSessionDto>(200)
            .ProducesProblem(404));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(GetPaymentSessionQuery req, CancellationToken ct)
    {
        var result = await _mediator.Send(req, ct);

        if (result == null)
        {
            HttpContext.Response.StatusCode = 404;
            return;
        }

        Response = result;
    }
}
