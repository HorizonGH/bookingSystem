using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Queries.GetById;

public class GetReservationByIdQueryHandler : IRequestHandler<GetReservationByIdQuery, ReservationDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetReservationByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ReservationDto?> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var reservation = await reservationRepo.GetByIdAsync(request.Id);

        if(reservation is null) {
            throw new KeyNotFoundException($"Reservation with ID {request.Id} not found.");
        }

        return ReservationMapper.ToDto(reservation);
    }
}