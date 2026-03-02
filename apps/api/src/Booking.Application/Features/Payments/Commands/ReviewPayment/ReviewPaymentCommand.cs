using Booking.Application.Common.DTOs.Payments;
using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Payments.Commands.ReviewPayment;

public class ReviewPaymentCommand : IRequest<PaymentDto>
{
    [BindFrom("paymentId")]
    public Guid PaymentId { get; set; }

    public bool Approve { get; set; }
    public string? AdminNotes { get; set; }

    // Set server-side from the authenticated user – not bound from the request body
    public Guid ReviewedByUserId { get; set; }
}
