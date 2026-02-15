using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Workers.Commands.Update;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Workers;

public class UpdateWorkerEndpoint : CoreEndpoint<UpdateWorkerRequest, WorkerDto>
{
    public UpdateWorkerEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Put("/workers/{workerId}");
        Description(d => d
            .WithTags("Workers")
            .WithSummary("Update a worker")
            .WithDescription("Updates worker information")
            .Produces(200)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(UpdateWorkerRequest req, CancellationToken ct)
    {
        var workerId = Route<Guid>("workerId");
        
        try
        {
            var command = new UpdateWorkerCommand
            {
                WorkerId = workerId,
                Request = req
            };
            Response = await _mediator.Send(command, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 404);
        }
    }
}
