using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Queries.GetAvailableTimeSlots;

public class GetAvailableTimeSlotsQuery : IRequest<List<TimeSlotDto>>
{
    public Guid WorkerId { get; set; }
    public Guid? ServiceId { get; set; }
    public DateTime Date { get; set; }
    public int SlotDurationMinutes { get; set; } = 60;
    public Guid TenantId { get; set; }
}
