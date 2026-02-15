using Booking.Application.Features.Workers.Commands.Delete;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Workers;

public class DeleteWorkerEndpoint : CoreEndpoint<DeleteWorkerCommand, bool>
{
    public DeleteWorkerEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Delete("/workers/{workerId}");
        Description(d => d
            .WithTags("Workers")
            .WithSummary("Delete a worker")
            .WithDescription("Deletes a worker. Cannot delete the last worker of a tenant.")
            .Produces(204)
            .ProducesProblem(400)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(DeleteWorkerCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        await Send.OkAsync(ct);
    }

}
