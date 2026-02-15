using MediatR;

namespace Booking.Application.Features.Workers.Commands.Delete;

public class DeleteWorkerCommand : IRequest<bool>
{
    public Guid WorkerId { get; set; }
}
