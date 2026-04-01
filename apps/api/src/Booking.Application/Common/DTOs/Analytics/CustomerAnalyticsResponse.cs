namespace Booking.Application.Common.DTOs.Analytics;

public class CustomerAnalyticsResponse
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalCustomers { get; set; }
    public int NewCustomers { get; set; }
    public int ReturningCustomers { get; set; }
    public decimal LifetimeRevenue { get; set; }
    public double AverageBookingIntervalDays { get; set; }
}
