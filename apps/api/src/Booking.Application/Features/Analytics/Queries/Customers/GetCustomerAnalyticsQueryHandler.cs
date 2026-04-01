using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Analytics.Queries.Customers;

public class GetCustomerAnalyticsQueryHandler : IRequestHandler<GetCustomerAnalyticsQuery, CustomerAnalyticsResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCustomerAnalyticsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CustomerAnalyticsResponse> Handle(GetCustomerAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var (startDate, endDate, endExclusive) = ResolveDateRange(request.StartDate, request.EndDate);

        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var reservationsInRange = await reservationRepo.GetAll()
            .Where(r => r.TenantId == request.TenantId)
            .Where(r => r.StartTime >= startDate && r.StartTime < endExclusive)
            .Select(r => new ReservationPoint(r.ClientId, r.StartTime, r.Price))
            .ToListAsync(cancellationToken);

        var clientIdsInRange = reservationsInRange
            .Select(r => r.ClientId)
            .Distinct()
            .ToList();

        var totalCustomers = clientIdsInRange.Count;

        var clientFirstDates = await reservationRepo.GetAll()
            .Where(r => r.TenantId == request.TenantId)
            .Where(r => clientIdsInRange.Contains(r.ClientId))
            .GroupBy(r => r.ClientId)
            .Select(g => new ClientFirstDate(g.Key, g.Min(x => x.StartTime)))
            .ToListAsync(cancellationToken);

        var newCustomers = clientFirstDates.Count(c => c.FirstReservation >= startDate && c.FirstReservation < endExclusive);
        var returningCustomers = totalCustomers - newCustomers;

        var lifetimeRevenue = await reservationRepo.GetAll()
            .Where(r => r.TenantId == request.TenantId)
            .Where(r => r.StartTime >= startDate && r.StartTime < endExclusive)
            .Select(r => (decimal?)r.Price)
            .SumAsync(cancellationToken) ?? 0m;

        var averageIntervalDays = CalculateAverageIntervalDays(reservationsInRange);

        return new CustomerAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalCustomers = totalCustomers,
            NewCustomers = newCustomers,
            ReturningCustomers = returningCustomers,
            LifetimeRevenue = lifetimeRevenue,
            AverageBookingIntervalDays = averageIntervalDays
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

    private static double CalculateAverageIntervalDays(IEnumerable<ReservationPoint> reservations)
    {
        var intervals = new List<double>();

        foreach (var group in reservations.GroupBy(r => r.ClientId))
        {
            var ordered = group.OrderBy(r => r.StartTime).ToList();
            if (ordered.Count < 2)
                continue;

            for (var i = 1; i < ordered.Count; i++)
            {
                intervals.Add((ordered[i].StartTime - ordered[i - 1].StartTime).TotalDays);
            }
        }

        return intervals.Count == 0 ? 0 : intervals.Average();
    }

    private readonly record struct ReservationPoint(Guid ClientId, DateTime StartTime, decimal Price);
    private readonly record struct ClientFirstDate(Guid ClientId, DateTime FirstReservation);
}
