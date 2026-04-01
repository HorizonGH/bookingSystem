using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Models;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Analytics.Queries.Overview;

public class GetAnalyticsOverviewQueryHandler : IRequestHandler<GetAnalyticsOverviewQuery, AnalyticsOverviewDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAnalyticsOverviewQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AnalyticsOverviewDto> Handle(GetAnalyticsOverviewQuery request, CancellationToken cancellationToken)
    {
        var (startDate, endDate, endExclusive) = ResolveDateRange(request.StartDate, request.EndDate);

        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var reservationQuery = reservationRepo.GetAll()
            .Where(r => r.TenantId == request.TenantId)
            .Where(r => r.StartTime >= startDate && r.StartTime < endExclusive);

        var totalReservations = await reservationQuery.CountAsync(cancellationToken);
        var totalCancellations = await reservationQuery
            .Where(r => r.ReservationStatus == ReservationStatus.Cancelled)
            .CountAsync(cancellationToken);

        var activeUsers = await reservationQuery
            .Select(r => r.ClientId)
            .Distinct()
            .CountAsync(cancellationToken);

        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var activeWorkers = await workerRepo.GetAll()
            .Where(w => w.TenantId == request.TenantId && w.IsAvailableForBooking)
            .CountAsync(cancellationToken);

        var paymentRepo = _unitOfWork.ReadRepository<Payment>();
        var revenueQuery = paymentRepo.GetAll()
            .Where(p => p.TenantId == request.TenantId)
            .Where(p => p.Status == PaymentStatus.Approved)
            .Where(p => p.Created >= startDate && p.Created < endExclusive);

        var totalRevenue = await revenueQuery
            .Select(p => (decimal?)p.Amount)
            .SumAsync(cancellationToken) ?? 0m;

        var reservationDates = await reservationQuery
            .Select(r => r.StartTime)
            .ToListAsync(cancellationToken);

        var revenueItems = await revenueQuery
            .Select(p => new RevenuePoint(p.Created, p.Amount))
            .ToListAsync(cancellationToken);

        var interval = request.Interval;

        return new AnalyticsOverviewDto
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalReservations = totalReservations,
            TotalCancellations = totalCancellations,
            TotalRevenue = totalRevenue,
            ActiveWorkers = activeWorkers,
            ActiveUsers = activeUsers,
            ReservationsByInterval = BuildCountSeries(reservationDates, startDate, endDate, interval),
            RevenueByInterval = BuildAmountSeries(revenueItems, startDate, endDate, interval)
        };
    }

    private static (DateTime startDate, DateTime endDate, DateTime endExclusive) ResolveDateRange(
        DateTime? startDate,
        DateTime? endDate)
    {
        var resolvedEnd = endDate?.Date ?? DateTime.UtcNow.Date;
        var resolvedStart = startDate?.Date ?? resolvedEnd.AddDays(-30);

        if (resolvedStart > resolvedEnd)
            throw new InvalidOperationException("StartDate must be on or before EndDate.");

        resolvedEnd = DateTime.SpecifyKind(resolvedEnd, DateTimeKind.Utc);
        resolvedStart = DateTime.SpecifyKind(resolvedStart, DateTimeKind.Utc);
        var endExclusive = DateTime.SpecifyKind(resolvedEnd.AddDays(1), DateTimeKind.Utc);

        return (resolvedStart, resolvedEnd, endExclusive);
    }

    private static List<AnalyticsCountPointDto> BuildCountSeries(
        IEnumerable<DateTime> dates,
        DateTime startDate,
        DateTime endDate,
        AnalyticsInterval interval)
    {
        var buckets = InitializeBuckets(startDate, endDate, interval);
        var counts = buckets.ToDictionary(b => b, _ => 0);

        foreach (var date in dates)
        {
            var bucket = GetBucketStart(date, interval);
            if (counts.ContainsKey(bucket))
                counts[bucket]++;
        }

        return buckets.Select(b => new AnalyticsCountPointDto
        {
            PeriodStart = b,
            Count = counts[b]
        }).ToList();
    }

    private static List<AnalyticsAmountPointDto> BuildAmountSeries(
        IEnumerable<RevenuePoint> items,
        DateTime startDate,
        DateTime endDate,
        AnalyticsInterval interval)
    {
        var buckets = InitializeBuckets(startDate, endDate, interval);
        var sums = buckets.ToDictionary(b => b, _ => 0m);

        foreach (var item in items)
        {
            var bucket = GetBucketStart(item.Date, interval);
            if (sums.ContainsKey(bucket))
                sums[bucket] += item.Amount;
        }

        return buckets.Select(b => new AnalyticsAmountPointDto
        {
            PeriodStart = b,
            Amount = sums[b]
        }).ToList();
    }

    private static List<DateTime> InitializeBuckets(DateTime startDate, DateTime endDate, AnalyticsInterval interval)
    {
        var buckets = new List<DateTime>();
        var current = GetBucketStart(startDate, interval);
        var last = GetBucketStart(endDate, interval);

        while (current <= last)
        {
            buckets.Add(current);
            current = interval switch
            {
                AnalyticsInterval.Day => current.AddDays(1),
                AnalyticsInterval.Week => current.AddDays(7),
                AnalyticsInterval.Month => current.AddMonths(1),
                _ => current.AddDays(1)
            };
        }

        return buckets;
    }

    private static DateTime GetBucketStart(DateTime date, AnalyticsInterval interval)
    {
        var day = date.Date;

        return interval switch
        {
            AnalyticsInterval.Day => day,
            AnalyticsInterval.Week => day.AddDays(-(7 + (day.DayOfWeek - DayOfWeek.Monday)) % 7),
            AnalyticsInterval.Month => new DateTime(day.Year, day.Month, 1),
            _ => day
        };
    }

    private readonly record struct RevenuePoint(DateTime Date, decimal Amount);
}
