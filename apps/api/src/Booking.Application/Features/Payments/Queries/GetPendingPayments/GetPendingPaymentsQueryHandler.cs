using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Queries.GetPendingPayments;

public class GetPendingPaymentsQueryHandler : IRequestHandler<GetPendingPaymentsQuery, List<PaymentDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPendingPaymentsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<PaymentDto>> Handle(GetPendingPaymentsQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.ReadRepository<Payment>();
        var payments = await repo.GetAll(includes: [p => p.PaymentSession, p => p.Tenant])
            .Where(p => p.Status == PaymentStatus.Pending)
            .OrderBy(p => p.Created)
            .ToListAsync(cancellationToken);

        return payments.Select(PaymentMapper.ToDto).ToList();
    }
}
