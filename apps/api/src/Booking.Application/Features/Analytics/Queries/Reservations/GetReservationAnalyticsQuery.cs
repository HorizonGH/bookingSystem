using Booking.Application.Common.DTOs.Analytics;
using Booking.Domain.Enums;
using MediatR;

namespace Booking.Application.Features.Analytics.Queries.Reservations;

public class GetReservationAnalyticsQuery : IRequest<ReservationAnalyticsResponse>
{
    public Guid TenantId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? WorkerId { get; set; }
    public Guid? ServiceId { get; set; }
    public ReservationStatus? Status { get; set; }
}
