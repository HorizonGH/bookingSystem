using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Workers.Commands.Create;

public class CreateWorkerCommand : IRequest<WorkerDto>
{
    public CreateWorkerRequest Request { get; set; } = null!;

    // TenantId is copied from the incoming request to make handler validations explicit
    public Guid TenantId { get; set; }
}
