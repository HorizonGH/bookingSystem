using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Workers.Queries.GetById;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Workers;

public class GetWorkerByIdEndpoint : CoreEndpoint<GetWorkerByIdQuery, WorkerDto>
{
    public GetWorkerByIdEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/workers/{workerId}");
        AllowAnonymous();
        Description(d => d
            .WithTags("Workers")
            .WithSummary("Get a worker by ID")
            .WithDescription("Retrieves a single worker by ID")
            .Produces<WorkerDto>(200)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(GetWorkerByIdQuery query, CancellationToken ct)
    {
       Response = await _mediator.Send(query, ct);
       await Send.OkAsync(Response, ct);
    }
}
