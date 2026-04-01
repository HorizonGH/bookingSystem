namespace Booking.Application.Common.DTOs.Analytics;

public class AnalyticsOverviewDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalReservations { get; set; }
    public int TotalCancellations { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ActiveWorkers { get; set; }
    public int ActiveUsers { get; set; }
    public List<AnalyticsCountPointDto> ReservationsByInterval { get; set; } = new();
    public List<AnalyticsAmountPointDto> RevenueByInterval { get; set; } = new();
}

public class AnalyticsCountPointDto
{
    public DateTime PeriodStart { get; set; }
    public int Count { get; set; }
}

public class AnalyticsAmountPointDto
{
    public DateTime PeriodStart { get; set; }
    public decimal Amount { get; set; }
}
