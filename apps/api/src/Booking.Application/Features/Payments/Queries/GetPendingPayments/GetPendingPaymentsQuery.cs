using Booking.Application.Common.DTOs.Payments;
using MediatR;

namespace Booking.Application.Features.Payments.Queries.GetPendingPayments;

/// <summary>
/// Admin query to get all payments pending review.
/// </summary>
public class GetPendingPaymentsQuery : IRequest<List<PaymentDto>>
{
}
