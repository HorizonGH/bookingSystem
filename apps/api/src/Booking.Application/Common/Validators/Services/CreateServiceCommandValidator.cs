using Booking.Application.Features.Services.Commands.Create;
using FastEndpoints;
using FluentValidation;

namespace Booking.Application.Common.Validators.Services;

public class CreateServiceCommandValidator : Validator<CreateServiceCommand>
{
    public CreateServiceCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service name is required.")
            .MaximumLength(200).WithMessage("Service name must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.DurationMinutes)
            .GreaterThan(0).WithMessage("Duration must be greater than 0 minutes.")
            .LessThanOrEqualTo(1440).WithMessage("Duration must not exceed 24 hours (1440 minutes).");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be 0 or greater.");

        RuleFor(x => x.BufferTimeBefore)
            .GreaterThanOrEqualTo(0).WithMessage("Buffer time before must be 0 or greater.");

        RuleFor(x => x.BufferTimeAfter)
            .GreaterThanOrEqualTo(0).WithMessage("Buffer time after must be 0 or greater.");

        RuleFor(x => x.MaxAdvanceBookingDays)
            .GreaterThan(0).WithMessage("Max advance booking days must be greater than 0.");

        RuleFor(x => x.MinAdvanceBookingHours)
            .GreaterThanOrEqualTo(0).WithMessage("Min advance booking hours must be 0 or greater.");
    }
}
