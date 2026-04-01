using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Features.Analytics.Queries.Customers;
using Booking.Infrastructure.Authorization;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Analytics;

public class GetCustomerAnalyticsRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class GetCustomerAnalyticsEndpoint : CoreEndpoint<GetCustomerAnalyticsRequest, CustomerAnalyticsResponse>
{
    public GetCustomerAnalyticsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/analytics/customers");

        Policies(PolicyNames.TenantAccess, PolicyNames.HasAnalytics);

        Description(d => d
            .WithTags("Analytics")
            .WithSummary("Get customer analytics")
            .WithDescription(@"Returns customer analytics for a tenant.

                Query Parameters:
                - startDate: Start of the date range (default: last 30 days)
                - endDate: End of the date range (default: today)")
            .Produces<CustomerAnalyticsResponse>(200)
            .ProducesProblem(400)
            .ProducesProblem(403));
    }

    public override async Task HandleAsync(GetCustomerAnalyticsRequest req, CancellationToken ct)
    {
        try
        {
            var tenantId = Route<Guid>("tenantId");

            var query = new GetCustomerAnalyticsQuery
            {
                TenantId = tenantId,
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
