using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Delete;

public class DeleteReservationCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}