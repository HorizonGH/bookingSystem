using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.WorkerSchedules.Commands.BatchCreate;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class BatchCreateWorkerScheduleEndpoint : CoreEndpoint<BatchCreateWorkerScheduleRequest, List<WorkerScheduleDto>>
{
    public BatchCreateWorkerScheduleEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/tenants/{tenantId}/workers/{workerId}/schedules/batch");
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Batch create worker schedules")
            .WithDescription("Creates multiple schedule entries at once for a worker. Useful for setting up weekly recurring schedules. Maximum 50 schedules per batch.")
            .Produces(201)
            .ProducesProblem(400));
        
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(BatchCreateWorkerScheduleRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var workerId = Route<Guid>("workerId");
            
            req.WorkerId = workerId;
            
            var command = new BatchCreateWorkerScheduleCommand 
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
