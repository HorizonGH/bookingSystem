using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Common.Models;
using Booking.Application.Features.Analytics.Queries.Overview;
using Booking.Infrastructure.Authorization;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Analytics;

public class GetAnalyticsOverviewRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public AnalyticsInterval Interval { get; set; } = AnalyticsInterval.Day;
}

public class GetAnalyticsOverviewEndpoint : CoreEndpoint<GetAnalyticsOverviewRequest, AnalyticsOverviewDto>
{
    public GetAnalyticsOverviewEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/analytics/overview");

        Policies(PolicyNames.TenantAccess, PolicyNames.HasAnalytics);

        Description(d => d
            .WithTags("Analytics")
            .WithSummary("Get analytics overview")
            .WithDescription(@"Returns high-level analytics for a tenant.

                Query Parameters:
                - startDate: Start of the date range (default: last 30 days)
                - endDate: End of the date range (default: today)
                - interval: Day, Week, or Month (default: Day)")
            .Produces<AnalyticsOverviewDto>(200)
            .ProducesProblem(400)
            .ProducesProblem(403));
    }

    public override async Task HandleAsync(GetAnalyticsOverviewRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");

            var query = new GetAnalyticsOverviewQuery
            {
                TenantId = tenantId,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                Interval = req.Interval
            };

            Response = await _mediator.Send(query, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
