using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Features.Payments.Commands.ReviewPayment;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

public class ReviewPaymentEndpoint : CoreEndpoint<ReviewPaymentCommand, PaymentDto>
{
    private readonly ICurrentUserService _currentUserService;

    public ReviewPaymentEndpoint(IMediator mediator, ICurrentUserService currentUserService) : base(mediator)
    {
        _currentUserService = currentUserService;
    }

    public override void Configure()
    {
        Post("/payments/{paymentId}/review");

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Review a payment (Admin)")
            .WithDescription("Admin endpoint to approve or reject a pending payment. Approving activates the tenant's subscription for 30 days.")
            .Produces<PaymentDto>(200)
            .ProducesProblem(400));

        Roles("SuperAdmin");
    }

    public override async Task HandleAsync(ReviewPaymentCommand req, CancellationToken ct)
    {
        // Enforce server-side reviewer identity regardless of what was sent in the body
        req.ReviewedByUserId = _currentUserService.UserId ?? Guid.Empty;

        try
        {
            Response = await _mediator.Send(req, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
