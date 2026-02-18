using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Commands.Delete;

public class DeleteWorkerScheduleCommand : IRequest<bool>
{
    public Guid ScheduleId { get; set; }
    public Guid TenantId { get; set; }
}
