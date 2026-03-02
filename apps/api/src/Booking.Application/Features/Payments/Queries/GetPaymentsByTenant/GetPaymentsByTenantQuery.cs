using Booking.Application.Common.DTOs.Payments;
using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Payments.Queries.GetPaymentsByTenant;

public class GetPaymentsByTenantQuery : IRequest<List<PaymentDto>>
{
    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }
}
