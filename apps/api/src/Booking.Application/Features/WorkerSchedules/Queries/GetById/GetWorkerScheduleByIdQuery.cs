using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Queries.GetById;

public class GetWorkerScheduleByIdQuery : IRequest<WorkerScheduleDto?>
{
    public Guid ScheduleId { get; set; }
    public Guid TenantId { get; set; }
}
