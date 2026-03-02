using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Commands.CancelPaymentSession;

public class CancelPaymentSessionCommandHandler : IRequestHandler<CancelPaymentSessionCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public CancelPaymentSessionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelPaymentSessionCommand request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.ReadRepository<PaymentSession>();

        var session = await repo.GetAll()
            .Where(ps => ps.Id == request.SessionId && ps.TenantId == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (session == null)
            throw new KeyNotFoundException("Payment session not found");

        if (session.Status != PaymentSessionStatus.WaitingPayment)
            throw new InvalidOperationException(
                $"Cannot cancel a session in '{session.Status}' status. Only sessions awaiting payment can be cancelled.");

        var writeRepo = _unitOfWork.WriteRepository<PaymentSession>();
        session.Status = PaymentSessionStatus.Expired;
        writeRepo.Update(session);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
