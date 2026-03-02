using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Queries.GetPaymentsByTenant;

public class GetPaymentsByTenantQueryHandler : IRequestHandler<GetPaymentsByTenantQuery, List<PaymentDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPaymentsByTenantQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PaymentDto>> Handle(GetPaymentsByTenantQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.ReadRepository<Payment>();
        var payments = await repo.GetAll(includes: [p => p.PaymentSession, p => p.Tenant])
            .Where(p => p.TenantId == request.TenantId)
            .OrderByDescending(p => p.Created)
            .ToListAsync(cancellationToken);

        return payments.Select(PaymentMapper.ToDto).ToList();
    }
}
