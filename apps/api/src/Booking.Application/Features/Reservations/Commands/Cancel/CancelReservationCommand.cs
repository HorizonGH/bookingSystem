using FastEndpoints;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Cancel;

public class CancelReservationCommand : IRequest
{
    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }

    [BindFrom("reservationId")]
    public Guid ReservationId { get; set; }

    public string? CancellationReason { get; set; }
}
