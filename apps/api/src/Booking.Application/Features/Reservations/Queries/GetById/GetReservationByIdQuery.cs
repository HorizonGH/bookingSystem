using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Queries.GetById;

public class GetReservationByIdQuery : IRequest<ReservationDto?>
{
    public Guid Id { get; set; }
}