using Booking.Application.Features.Workers.Queries.GetByTenant;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Workers;

public class GetWorkersByTenantEndpoint : CoreEndpoint<GetWorkersByTenantQuery, WorkersByTenantResponse>
{
    public GetWorkersByTenantEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/workers");
        AllowAnonymous();
        Description(d => d
            .WithTags("Workers")
            .WithSummary("Get available workers for a tenant")
            .WithDescription(@"Retrieves all available workers for a tenant. 
                This endpoint is designed for the reservation flow and includes plan information.
                - For Free plan with 1 worker: IsSingleWorkerOnly will be true
                - For other plans: Returns list of available workers for selection")
            .Produces<WorkersByTenantResponse>(200)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(GetWorkersByTenantQuery query, CancellationToken ct)
    {
        Response = await _mediator.Send(query, ct);
        await Send.OkAsync(Response, ct);
    }
}
