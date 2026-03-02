using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Features.Payments.Queries.GetPendingPayments;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class GetPendingPaymentsEndpoint : CoreEndpointWithoutRequest<List<PaymentDto>>
{
    public GetPendingPaymentsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/payments/pending");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Get pending payments (Admin)")
            .WithDescription("Admin endpoint that returns all payments awaiting review, ordered by creation date.")
            .Produces<List<PaymentDto>>(200));

        Roles("SuperAdmin");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetPendingPaymentsQuery();
        Response = await _mediator.Send(query, ct);
    }
}
