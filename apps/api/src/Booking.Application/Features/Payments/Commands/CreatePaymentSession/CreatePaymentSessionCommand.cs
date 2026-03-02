using Booking.Application.Common.DTOs.Payments;
using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Payments.Commands.CreatePaymentSession;

public class CreatePaymentSessionCommand : IRequest<PaymentInstructionsDto>
{
    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }

    public Guid PlanId { get; set; }

    /// <summary>Accepted values: Transfermovil, Zelle</summary>
    public string PaymentMethod { get; set; } = string.Empty;
}
