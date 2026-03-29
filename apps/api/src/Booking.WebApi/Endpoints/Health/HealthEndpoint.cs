using Booking.Infrastructure.Persistence;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace Booking.WebApi.Endpoints.Health;

public class HealthEndpoint : EndpointWithoutRequest
{
    private readonly BookingDbContext _dbContext;

    public HealthEndpoint(BookingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override void Configure()
    {
        Get("/health");
        AllowAnonymous();
        Description(d => d
            .WithTags("Health")
            .WithSummary("Simple health check endpoint + DB connectivity check")
            .WithDescription("Checks API availability and performs a simple DB query to warm up the database connection on cold start."));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        // Simple DB query to trigger the connection and avoid cold start
        var dbReachable = await _dbContext.Tenants.AsNoTracking().AnyAsync(ct);

        var response = new
        {
            status = "Healthy",
            db = dbReachable ? "OK" : "NoData",
            checkedAt = DateTime.UtcNow
        };

        await Send.OkAsync(response, ct);
    }
}
