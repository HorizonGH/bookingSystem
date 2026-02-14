using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Update;

public class UpdateReservationCommand : IRequest<ReservationDto>
{
    public UpdateReservationRequest Request { get; set; } = new();
}