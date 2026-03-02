using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Queries.GetPaymentSession;

public class GetPaymentSessionQueryHandler : IRequestHandler<GetPaymentSessionQuery, PaymentSessionDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPaymentSessionQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentSessionDto?> Handle(GetPaymentSessionQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.ReadRepository<PaymentSession>();
        var session = await repo.GetAll(includes: [ps => ps.Plan])
            .Where(ps => ps.Id == request.PaymentSessionId && ps.TenantId == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        return session == null ? null : PaymentMapper.ToDto(session);
    }
}
