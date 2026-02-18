using Booking.Application.Features.WorkerSchedules.Commands.Delete;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class DeleteWorkerScheduleEndpoint : CoreEndpointWithoutRequest
{
    public DeleteWorkerScheduleEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Delete("/tenants/{tenantId}/workers/{workerId}/schedules/{scheduleId}");
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Delete a worker schedule")
            .WithDescription("Deletes a schedule entry for a worker.")
            .Produces(204)
            .ProducesProblem(400)
            .ProducesProblem(404));
        
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var scheduleId = Route<Guid>("scheduleId");
            
            var command = new DeleteWorkerScheduleCommand 
            { 
                ScheduleId = scheduleId,
                TenantId = tenantId 
            };
            
            await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 204;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, ex.Message.Contains("not found") ? 404 : 400);
        }
    }
}
