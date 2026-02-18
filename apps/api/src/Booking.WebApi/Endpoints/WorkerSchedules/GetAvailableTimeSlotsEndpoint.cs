using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.WorkerSchedules.Queries.GetAvailableTimeSlots;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.WorkerSchedules;

public class GetAvailableTimeSlotsRequest
{
    public Guid? ServiceId { get; set; }
    public DateTime Date { get; set; }
    public int SlotDurationMinutes { get; set; } = 60;
}

public class GetAvailableTimeSlotsEndpoint : CoreEndpoint<GetAvailableTimeSlotsRequest, List<TimeSlotDto>>
{
    public GetAvailableTimeSlotsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/workers/{workerId}/availability");
        AllowAnonymous(); // Public endpoint for booking calendar
        
        Description(d => d
            .WithTags("Worker Schedules")
            .WithSummary("Get available time slots for a worker")
            .WithDescription(@"Retrieves available time slots for a worker on a specific date. Takes into account worker schedules, existing reservations, and service buffer times.
                
                Query Parameters:
                - date: The date to check availability (required)
                - serviceId: Service ID to consider for duration and buffer times (optional)
                - slotDurationMinutes: Duration of each time slot in minutes (default: 60, ignored if serviceId is provided)")
            .Produces(200)
            .ProducesProblem(400));
    }

    public override async Task HandleAsync(GetAvailableTimeSlotsRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var workerId = Route<Guid>("workerId");
            
            var query = new GetAvailableTimeSlotsQuery 
            { 
                WorkerId = workerId,
                TenantId = tenantId,
                ServiceId = req.ServiceId,
                Date = req.Date,
                SlotDurationMinutes = req.SlotDurationMinutes
            };
            
            Response = await _mediator.Send(query, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
