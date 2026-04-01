using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Analytics.Queries.Reservations;

public class GetReservationAnalyticsQueryHandler : IRequestHandler<GetReservationAnalyticsQuery, ReservationAnalyticsResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetReservationAnalyticsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ReservationAnalyticsResponse> Handle(GetReservationAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var (startDate, endDate, endExclusive) = ResolveDateRange(request.StartDate, request.EndDate);

        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var query = reservationRepo.GetAll()
            .Where(r => r.TenantId == request.TenantId)
            .Where(r => r.StartTime >= startDate && r.StartTime < endExclusive);

        if (request.WorkerId.HasValue)
            query = query.Where(r => r.WorkerId == request.WorkerId.Value);

        if (request.ServiceId.HasValue)
            query = query.Where(r => r.ServiceId == request.ServiceId.Value);

        if (request.Status.HasValue)
            query = query.Where(r => r.ReservationStatus == request.Status.Value);

        var totalReservations = await query.CountAsync(cancellationToken);
        var totalCancellations = await query
            .Where(r => r.ReservationStatus == ReservationStatus.Cancelled)
            .CountAsync(cancellationToken);

        var byStatus = await query
            .GroupBy(r => r.ReservationStatus)
            .Select(g => new ReservationStatusCountDto
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        var byWorker = await query
            .GroupBy(r => r.WorkerId)
            .Select(g => new ReservationWorkerCountDto
            {
                WorkerId = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        var byService = await query
            .GroupBy(r => r.ServiceId)
            .Select(g => new ReservationServiceCountDto
            {
                ServiceId = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        var byDay = await query
            .GroupBy(r => r.StartTime.Date)
            .Select(g => new ReservationDayCountDto
            {
                Day = g.Key,
                Count = g.Count()
            })
            .OrderBy(g => g.Day)
            .ToListAsync(cancellationToken);

        return new ReservationAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalReservations = totalReservations,
            TotalCancellations = totalCancellations,
            ByStatus = byStatus,
            ByWorker = byWorker,
            ByService = byService,
            ByDay = byDay
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
}
