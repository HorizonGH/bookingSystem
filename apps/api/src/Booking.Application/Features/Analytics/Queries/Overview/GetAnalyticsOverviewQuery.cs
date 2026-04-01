using Booking.Application.Common.DTOs.Analytics;
using Booking.Application.Common.Models;
using MediatR;

namespace Booking.Application.Features.Analytics.Queries.Overview;

public class GetAnalyticsOverviewQuery : IRequest<AnalyticsOverviewDto>
{
    public Guid TenantId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public AnalyticsInterval Interval { get; set; } = AnalyticsInterval.Day;
}
