using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Features.Analytics.Queries.Workers;
using Booking.Infrastructure.Authorization;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Analytics;

public class GetWorkerAnalyticsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class GetWorkerAnalyticsEndpoint : CoreEndpoint<GetWorkerAnalyticsRequest, WorkerAnalyticsResponse>
{
    public GetWorkerAnalyticsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/analytics/workers/{workerId}");

        Policies(PolicyNames.TenantAccess, PolicyNames.HasAnalytics);

        Description(d => d
            .WithTags("Analytics")
            .WithSummary("Get worker analytics")
            .WithDescription(@"Returns worker productivity analytics.

                Query Parameters:
                - startDate: Start of the date range (default: last 30 days)
                - endDate: End of the date range (default: today)")
            .Produces<WorkerAnalyticsResponse>(200)
            .ProducesProblem(400)
            .ProducesProblem(403));
    }

    public override async Task HandleAsync(GetWorkerAnalyticsRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");
            var workerId = Route<Guid>("workerId");

            var query = new GetWorkerAnalyticsQuery
            {
                TenantId = tenantId,
                WorkerId = workerId,
                StartDate = req.StartDate,
                EndDate = req.EndDate
            };

            Response = await _mediator.Send(query, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
