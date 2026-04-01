using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Analytics.Queries.Workers;

public class GetWorkerAnalyticsQueryHandler : IRequestHandler<GetWorkerAnalyticsQuery, WorkerAnalyticsResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetWorkerAnalyticsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkerAnalyticsResponse> Handle(GetWorkerAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var (startDate, endDate, endExclusive) = ResolveDateRange(request.StartDate, request.EndDate);

        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var query = reservationRepo.GetAll()
            .Where(r => r.TenantId == request.TenantId)
            .Where(r => r.WorkerId == request.WorkerId)
            .Where(r => r.StartTime >= startDate && r.StartTime < endExclusive);

        var totalReservations = await query.CountAsync(cancellationToken);
        var confirmedReservations = await query
            .Where(r => r.ReservationStatus == ReservationStatus.Confirmed)
            .CountAsync(cancellationToken);
        var completedReservations = await query
            .Where(r => r.ReservationStatus == ReservationStatus.Completed)
            .CountAsync(cancellationToken);
        var cancelledReservations = await query
            .Where(r => r.ReservationStatus == ReservationStatus.Cancelled)
            .CountAsync(cancellationToken);
        var noShowReservations = await query
            .Where(r => r.ReservationStatus == ReservationStatus.NoShow)
            .CountAsync(cancellationToken);

        var bookedReservations = await query
            .Where(r => r.ReservationStatus == ReservationStatus.Confirmed || r.ReservationStatus == ReservationStatus.Completed)
            .Select(r => new ReservationWindow(r.StartTime, r.EndTime))
            .ToListAsync(cancellationToken);

        var bookedHours = bookedReservations.Sum(r => (decimal)(r.EndTime - r.StartTime).TotalHours);

        var conversionRate = totalReservations == 0
            ? 0m
            : (decimal)(confirmedReservations + completedReservations) / totalReservations;

        var noShowRate = totalReservations == 0
            ? 0m
            : (decimal)noShowReservations / totalReservations;

        return new WorkerAnalyticsResponse
        {
            WorkerId = request.WorkerId,
            StartDate = startDate,
            EndDate = endDate,
            TotalReservations = totalReservations,
            ConfirmedReservations = confirmedReservations,
            CompletedReservations = completedReservations,
            CancelledReservations = cancelledReservations,
            NoShowReservations = noShowReservations,
            BookedHours = bookedHours,
            ConversionRate = conversionRate,
            NoShowRate = noShowRate
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

    private readonly record struct ReservationWindow(DateTime StartTime, DateTime EndTime);
}
