using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.WorkerSchedules.Queries.GetByWorker;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class GetWorkerSchedulesByWorkerRequest
{
    public DateTime? Date { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

public class GetWorkerSchedulesByWorkerEndpoint : CoreEndpoint<GetWorkerSchedulesByWorkerRequest, List<WorkerScheduleDto>>
{
    public GetWorkerSchedulesByWorkerEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/workers/{workerId}/schedules");
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Get all schedules for a worker")
            .WithDescription(@"Retrieves all schedule entries for a worker. Can be filtered by date.
                
                Query Parameters:
                - date: Filter schedules for a specific date (returns both specific date overrides and recurring schedules for that day)
                - includeInactive: Include inactive/unavailable schedules (default: false)")
            .Produces(200)
            .ProducesProblem(400));
        
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetWorkerSchedulesByWorkerRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var workerId = Route<Guid>("workerId");
            
            var query = new GetWorkerSchedulesByWorkerQuery 
            { 
                WorkerId = workerId,
                TenantId = tenantId,
                Date = req.Date,
                IncludeInactive = req.IncludeInactive
            };
            
            Response = await _mediator.Send(query, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
