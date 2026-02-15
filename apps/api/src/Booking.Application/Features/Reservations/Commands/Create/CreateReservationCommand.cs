using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Create;

public class CreateReservationCommand : IRequest<ReservationDto>
{
    public Guid? TenantId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid WorkerId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal Price { get; set; }

    // Client Information
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string? Notes { get; set; }
}