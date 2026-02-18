using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Commands.BatchCreate;

public class BatchCreateWorkerScheduleCommand : IRequest<List<WorkerScheduleDto>>
{
    public BatchCreateWorkerScheduleRequest Request { get; set; } = null!;
    public Guid TenantId { get; set; }
}
