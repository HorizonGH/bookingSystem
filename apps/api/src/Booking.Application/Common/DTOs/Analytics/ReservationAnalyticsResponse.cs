using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Analytics;

public class ReservationAnalyticsResponse
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalReservations { get; set; }
    public int TotalCancellations { get; set; }
    public List<ReservationStatusCountDto> ByStatus { get; set; } = new();
    public List<ReservationWorkerCountDto> ByWorker { get; set; } = new();
    public List<ReservationServiceCountDto> ByService { get; set; } = new();
    public List<ReservationDayCountDto> ByDay { get; set; } = new();
}

public class ReservationStatusCountDto
{
    public ReservationStatus Status { get; set; }
    public int Count { get; set; }
}

public class ReservationWorkerCountDto
{
    public Guid WorkerId { get; set; }
    public int Count { get; set; }
}

public class ReservationServiceCountDto
{
    public Guid ServiceId { get; set; }
    public int Count { get; set; }
}

public class ReservationDayCountDto
{
    public DateTime Day { get; set; }
    public int Count { get; set; }
}
