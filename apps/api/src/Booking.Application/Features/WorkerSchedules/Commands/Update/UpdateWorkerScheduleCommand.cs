using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Commands.Update;

public class UpdateWorkerScheduleCommand : IRequest<WorkerScheduleDto>
{
    public Guid ScheduleId { get; set; }
    public UpdateWorkerScheduleRequest Request { get; set; } = null!;
    public Guid TenantId { get; set; }
}
