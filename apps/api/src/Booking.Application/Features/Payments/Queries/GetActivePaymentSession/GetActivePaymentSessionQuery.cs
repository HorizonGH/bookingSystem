using Booking.Application.Common.DTOs.Payments;
using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Payments.Queries.GetActivePaymentSession;

public class GetActivePaymentSessionQuery : IRequest<PaymentSessionDto?>
{
    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }
}
