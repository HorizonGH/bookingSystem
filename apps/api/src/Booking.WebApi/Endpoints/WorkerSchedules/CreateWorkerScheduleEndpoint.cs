using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.WorkerSchedules.Commands.Create;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class CreateWorkerScheduleEndpoint : CoreEndpoint<CreateWorkerScheduleRequest, WorkerScheduleDto>
{
    public CreateWorkerScheduleEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/tenants/{tenantId}/workers/{workerId}/schedules");
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Create a worker schedule")
            .WithDescription("Creates a new schedule entry for a worker. Can be a recurring weekly schedule or a specific date override.")
            .Produces(201)
            .ProducesProblem(400));
        
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(CreateWorkerScheduleRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var workerId = Route<Guid>("workerId");
            
            req.WorkerId = workerId;
            
            var command = new CreateWorkerScheduleCommand 
            { 
                Request = req, 
                TenantId = tenantId 
            };
            
            Response = await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 201;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
