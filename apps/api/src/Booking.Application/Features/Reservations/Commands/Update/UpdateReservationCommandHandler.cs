using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Update;

public class UpdateReservationCommandHandler : IRequestHandler<UpdateReservationCommand, ReservationDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateReservationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ReservationDto> Handle(UpdateReservationCommand request, CancellationToken cancellationToken)
    {
        var reservationRepo = _unitOfWork.WriteRepository<Reservation>();
        var reservation = await reservationRepo.GetByIdAsync(request.Request.Id);
        if (reservation == null)
        {
            throw new KeyNotFoundException($"Reservation with ID {request.Request.Id} not found.");
        }

        ReservationMapper.UpdateEntity(request.Request, reservation);
        reservation.LastModified = DateTime.UtcNow;

        reservationRepo.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToDto(reservation);
    }
}