using Booking.Domain.Enums;
using Booking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Booking.Infrastructure.Services;

/// <summary>
/// Daily background job that:
/// 1. Expires subscriptions whose current period has ended.
/// 2. Expires payment sessions that have passed their expiration time.
/// </summary>
public class SubscriptionExpirationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionExpirationService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

    public SubscriptionExpirationService(
        IServiceScopeFactory scopeFactory,
        ILogger<SubscriptionExpirationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Subscription expiration background service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpirations(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing subscription expirations");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Subscription expiration background service stopped");
    }

    private async Task ProcessExpirations(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();

        await ExpireSubscriptions(dbContext, cancellationToken);
        await ExpirePaymentSessions(dbContext, cancellationToken);
    }

    private async Task ExpireSubscriptions(BookingDbContext dbContext, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var expiredSubscriptions = await dbContext.TenantPlans
            .Where(tp => tp.SubscriptionStatus == SubscriptionStatus.Active
                && tp.EndDate != null
                && tp.EndDate < now)
            .ToListAsync(cancellationToken);

        if (expiredSubscriptions.Count == 0)
            return;

        foreach (var subscription in expiredSubscriptions)
        {
            subscription.SubscriptionStatus = SubscriptionStatus.Expired;
            _logger.LogInformation(
                "Expired subscription for tenant {TenantId}, plan ended at {EndDate}",
                subscription.TenantId,
                subscription.EndDate);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Expired {Count} subscriptions", expiredSubscriptions.Count);
    }

    private async Task ExpirePaymentSessions(BookingDbContext dbContext, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var expiredSessions = await dbContext.PaymentSessions
            .Where(ps => ps.Status == PaymentSessionStatus.WaitingPayment
                && ps.ExpiresAt < now)
            .ToListAsync(cancellationToken);

        if (expiredSessions.Count == 0)
            return;

        foreach (var session in expiredSessions)
        {
            session.Status = PaymentSessionStatus.Expired;
            _logger.LogInformation(
                "Expired payment session {SessionId} for tenant {TenantId}",
                session.Id,
                session.TenantId);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Expired {Count} payment sessions", expiredSessions.Count);
    }
}
