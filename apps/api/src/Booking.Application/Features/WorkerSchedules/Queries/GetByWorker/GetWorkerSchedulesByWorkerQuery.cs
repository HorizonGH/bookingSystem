using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Queries.GetByWorker;

public class GetWorkerSchedulesByWorkerQuery : IRequest<List<WorkerScheduleDto>>
{
    public Guid WorkerId { get; set; }
    public Guid TenantId { get; set; }
    public DateTime? Date { get; set; }
    public bool IncludeInactive { get; set; } = false;
}
