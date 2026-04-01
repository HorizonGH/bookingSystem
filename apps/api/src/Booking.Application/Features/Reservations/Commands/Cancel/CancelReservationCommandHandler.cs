using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Reservations.Commands.Cancel;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public CancelReservationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();

        var reservation = await reservationRepo.GetAll()
            .Where(r => r.Id == request.ReservationId && r.TenantId == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (reservation == null)
            throw new KeyNotFoundException("Reservation not found.");

        if (reservation.ReservationStatus == ReservationStatus.Cancelled)
            throw new InvalidOperationException("Reservation is already cancelled.");

        reservation.ReservationStatus = ReservationStatus.Cancelled;
        reservation.CancelledAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.CancellationReason))
            reservation.CancellationReason = request.CancellationReason;

        var writeRepo = _unitOfWork.WriteRepository<Reservation>();
        writeRepo.Update(reservation);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
