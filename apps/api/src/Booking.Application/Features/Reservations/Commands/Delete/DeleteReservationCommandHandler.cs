using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Delete;

public class DeleteReservationCommandHandler : IRequestHandler<DeleteReservationCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteReservationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteReservationCommand request, CancellationToken cancellationToken)
    {
        var reservationRepo = _unitOfWork.WriteRepository<Reservation>();
        var reservation = await reservationRepo.GetByIdAsync(request.Id);
        if (reservation == null)
        {
            throw new KeyNotFoundException($"Reservation with ID {request.Id} not found.");
        }

        reservationRepo.Remove(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}