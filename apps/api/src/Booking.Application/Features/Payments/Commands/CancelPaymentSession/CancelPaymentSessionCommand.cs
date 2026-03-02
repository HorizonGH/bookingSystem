using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Payments.Commands.CancelPaymentSession;

public class CancelPaymentSessionCommand : IRequest
{
    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }

    [BindFrom("sessionId")]
    public Guid SessionId { get; set; }
}
