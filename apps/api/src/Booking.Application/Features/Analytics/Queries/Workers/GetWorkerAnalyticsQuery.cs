using Booking.Application.Common.DTOs.Analytics;
using MediatR;

namespace Booking.Application.Features.Analytics.Queries.Workers;

public class GetWorkerAnalyticsQuery : IRequest<WorkerAnalyticsResponse>
{
    public Guid TenantId { get; set; }
    public Guid WorkerId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
