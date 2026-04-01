using FastEndpoints;
using FluentValidation;

namespace Booking.Application.Features.Analytics.Queries.Customers;

public class GetCustomerAnalyticsQueryValidator : Validator<GetCustomerAnalyticsQuery>
{
    public GetCustomerAnalyticsQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("EndDate must be on or after StartDate.");
    }
}
