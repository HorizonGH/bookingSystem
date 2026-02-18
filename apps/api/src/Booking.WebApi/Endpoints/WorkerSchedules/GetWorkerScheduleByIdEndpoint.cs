using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.WorkerSchedules.Queries.GetById;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class GetWorkerScheduleByIdEndpoint : CoreEndpointWithoutRequest<WorkerScheduleDto?>
{
    public GetWorkerScheduleByIdEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/workers/{workerId}/schedules/{scheduleId}");
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Get a worker schedule by ID")
            .WithDescription("Retrieves a specific schedule entry for a worker.")
            .Produces(200)
            .ProducesProblem(404));
        
        Roles("TenantAdmin", "Worker");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var scheduleId = Route<Guid>("scheduleId");
            
            var query = new GetWorkerScheduleByIdQuery 
            { 
                ScheduleId = scheduleId,
                TenantId = tenantId 
            };
            
            Response = await _mediator.Send(query, ct);
            
            if (Response == null)
                ThrowError("Schedule not found", 404);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 404);
        }
    }
}
