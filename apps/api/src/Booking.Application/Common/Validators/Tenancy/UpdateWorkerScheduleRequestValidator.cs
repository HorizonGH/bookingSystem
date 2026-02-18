using Booking.Application.Common.DTOs.Tenancy;
using FluentValidation;

namespace Booking.Application.Common.Validators.Tenancy;

public class UpdateWorkerScheduleRequestValidator : AbstractValidator<UpdateWorkerScheduleRequest>
{
    public UpdateWorkerScheduleRequestValidator()
    {
        RuleFor(x => x.DayOfWeek)
            .IsInEnum().WithMessage("DayOfWeek must be a valid day of the week.");

        RuleFor(x => x.StartTime)
            .NotEmpty().WithMessage("StartTime is required.")
            .Must(BeValidTime).WithMessage("StartTime must be between 00:00 and 23:59.");

        RuleFor(x => x.EndTime)
            .NotEmpty().WithMessage("EndTime is required.")
            .Must(BeValidTime).WithMessage("EndTime must be between 00:00 and 23:59.")
            .GreaterThan(x => x.StartTime).WithMessage("EndTime must be after StartTime.");

        RuleFor(x => x.SpecificDate)
            .Must(BeInFutureOrToday)
            .When(x => x.SpecificDate.HasValue)
            .WithMessage("SpecificDate cannot be in the past.");
    }

    private bool BeValidTime(TimeSpan time)
    {
        return time >= TimeSpan.Zero && time < TimeSpan.FromHours(24);
    }

    private bool BeInFutureOrToday(DateTime? date)
    {
        if (!date.HasValue) return true;
        return date.Value.Date >= DateTime.UtcNow.Date;
    }
}
