using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Workers.Commands.Create;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Workers;

public class CreateWorkerEndpoint : CoreEndpoint<CreateWorkerRequest, WorkerDto>
{
    public CreateWorkerEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        // Support both direct create and tenant-scoped create (used by FE when tenantId is present)
        Post("/workers");
        Post("/tenants/{tenantId}/workers");

        Description(d => d
            .WithTags("Workers")
            .WithSummary("Create a new worker")
            .WithDescription("Creates a new worker for the tenant. Validates plan limits before creation.")
            .Produces(201)
            .ProducesProblem(400));
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(CreateWorkerRequest req, CancellationToken ct)
    {
        try
        {
            var command = new CreateWorkerCommand { Request = req, TenantId = req.TenantId }; 
            Response = await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 201;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
