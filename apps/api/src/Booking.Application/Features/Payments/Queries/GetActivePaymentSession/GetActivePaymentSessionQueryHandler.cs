using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Queries.GetActivePaymentSession;

public class GetActivePaymentSessionQueryHandler : IRequestHandler<GetActivePaymentSessionQuery, PaymentSessionDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetActivePaymentSessionQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentSessionDto?> Handle(GetActivePaymentSessionQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.ReadRepository<PaymentSession>();

        var session = await repo.GetAll(includes: [ps => ps.Plan])
            .Where(ps => ps.TenantId == request.TenantId
                && (ps.Status == PaymentSessionStatus.WaitingPayment || ps.Status == PaymentSessionStatus.WaitingReview)
                && ps.ExpiresAt > DateTime.UtcNow)
            .FirstOrDefaultAsync(cancellationToken);

        return session == null ? null : PaymentMapper.ToDto(session);
    }
}
