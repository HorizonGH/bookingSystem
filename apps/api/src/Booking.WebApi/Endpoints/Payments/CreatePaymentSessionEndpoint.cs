using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Features.Payments.Commands.CreatePaymentSession;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class CreatePaymentSessionEndpoint : CoreEndpoint<CreatePaymentSessionCommand, PaymentInstructionsDto>
{
    public CreatePaymentSessionEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/tenants/{tenantId}/payments/sessions");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Create a payment session")
            .WithDescription("Initiates a payment session for plan upgrade. Returns payment instructions for the selected payment method (Transfermóvil or Zelle).")
            .Produces<PaymentInstructionsDto>(201)
            .ProducesProblem(400));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(CreatePaymentSessionCommand req, CancellationToken ct)
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
