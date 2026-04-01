using Booking.Application.Common.DTOs.Analytics;
using MediatR;

namespace Booking.Application.Features.Analytics.Queries.Customers;

public class GetCustomerAnalyticsQuery : IRequest<CustomerAnalyticsResponse>
{
    public Guid TenantId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
