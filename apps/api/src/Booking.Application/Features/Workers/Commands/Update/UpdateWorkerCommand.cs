using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Workers.Commands.Update;

public class UpdateWorkerCommand : IRequest<WorkerDto>
{
    public Guid WorkerId { get; set; }
    public UpdateWorkerRequest Request { get; set; } = null!;
}
