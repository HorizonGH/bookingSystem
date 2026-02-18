using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.WorkerSchedules.Commands.Update;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class UpdateWorkerScheduleEndpoint : CoreEndpoint<UpdateWorkerScheduleRequest, WorkerScheduleDto>
{
    public UpdateWorkerScheduleEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Put("/tenants/{tenantId}/workers/{workerId}/schedules/{scheduleId}");
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Update a worker schedule")
            .WithDescription("Updates an existing schedule entry for a worker.")
            .Produces(200)
            .ProducesProblem(400)
            .ProducesProblem(404));
        
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(UpdateWorkerScheduleRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var scheduleId = Route<Guid>("scheduleId");
            
            var command = new UpdateWorkerScheduleCommand 
            { 
                ScheduleId = scheduleId,
                Request = req, 
                TenantId = tenantId 
            };
            
            Response = await _mediator.Send(command, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, ex.Message.Contains("not found") ? 404 : 400);
        }
    }
}
