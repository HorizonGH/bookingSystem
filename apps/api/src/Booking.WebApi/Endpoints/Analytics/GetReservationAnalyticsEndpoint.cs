using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Features.Analytics.Queries.Reservations;
using Booking.Domain.Enums;
using Booking.Infrastructure.Authorization;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Analytics;

public class GetReservationAnalyticsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? WorkerId { get; set; }
    public Guid? ServiceId { get; set; }
    public ReservationStatus? Status { get; set; }
}

public class GetReservationAnalyticsEndpoint : CoreEndpoint<GetReservationAnalyticsRequest, ReservationAnalyticsResponse>
{
    public GetReservationAnalyticsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/analytics/reservations");

        Policies(PolicyNames.TenantAccess, PolicyNames.HasAnalytics);

        Description(d => d
            .WithTags("Analytics")
            .WithSummary("Get reservation analytics")
            .WithDescription(@"Returns reservation analytics for a tenant.

                Query Parameters:
                - startDate: Start of the date range (default: last 30 days)
                - endDate: End of the date range (default: today)
                - workerId: Filter by worker
                - serviceId: Filter by service
                - status: Filter by reservation status")
            .Produces<ReservationAnalyticsResponse>(200)
            .ProducesProblem(400)
            .ProducesProblem(403));
    }

    public override async Task HandleAsync(GetReservationAnalyticsRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");

            var query = new GetReservationAnalyticsQuery
            {
                TenantId = tenantId,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                WorkerId = req.WorkerId,
                ServiceId = req.ServiceId,
                Status = req.Status
            };

            Response = await _mediator.Send(query, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
