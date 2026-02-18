using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.WorkerSchedules.Commands.Create;

public class CreateWorkerScheduleCommand : IRequest<WorkerScheduleDto>
{
    public CreateWorkerScheduleRequest Request { get; set; } = null!;
    public Guid TenantId { get; set; }
}
