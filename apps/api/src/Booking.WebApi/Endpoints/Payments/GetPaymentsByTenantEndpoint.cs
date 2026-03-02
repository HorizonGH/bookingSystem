using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Features.Payments.Queries.GetPaymentsByTenant;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class GetPaymentsByTenantEndpoint : CoreEndpoint<GetPaymentsByTenantQuery, List<PaymentDto>>
{
    public GetPaymentsByTenantEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/payments");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Get payment history for a tenant")
            .WithDescription("Returns all payments for a specific tenant, ordered by most recent first.")
            .Produces<List<PaymentDto>>(200));

        Roles("TenantAdmin", "SuperAdmin");
    }

    public override async Task HandleAsync(GetPaymentsByTenantQuery req, CancellationToken ct)
    {
        Response = await _mediator.Send(req, ct);
    }
}
