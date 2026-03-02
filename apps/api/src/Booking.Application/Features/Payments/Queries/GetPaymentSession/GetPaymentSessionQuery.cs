using Booking.Application.Common.DTOs.Payments;
using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Payments.Queries.GetPaymentSession;

public class GetPaymentSessionQuery : IRequest<PaymentSessionDto?>
{
    [BindFrom("sessionId")]
    public Guid PaymentSessionId { get; set; }

    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }
}
