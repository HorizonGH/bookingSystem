namespace Booking.Application.Common.DTOs.Analytics;

public class WorkerAnalyticsResponse
{
    public Guid WorkerId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalReservations { get; set; }
    public int ConfirmedReservations { get; set; }
    public int CompletedReservations { get; set; }
    public int CancelledReservations { get; set; }
    public int NoShowReservations { get; set; }
    public decimal BookedHours { get; set; }
    public decimal ConversionRate { get; set; }
    public decimal NoShowRate { get; set; }
}
