using Booking.Application.Common.DTOs.Tenancy;
using FluentValidation;

namespace Booking.Application.Common.Validators.Tenancy;

public class BatchCreateWorkerScheduleRequestValidator : AbstractValidator<BatchCreateWorkerScheduleRequest>
{
    public BatchCreateWorkerScheduleRequestValidator()
    {
        RuleFor(x => x.WorkerId)
            .NotEmpty().WithMessage("WorkerId is required.");

        RuleFor(x => x.Schedules)
            .NotEmpty().WithMessage("At least one schedule entry is required.")
            .Must(x => x.Count <= 50).WithMessage("Cannot create more than 50 schedules at once.");

        RuleForEach(x => x.Schedules).ChildRules(schedule =>
        {
            schedule.RuleFor(x => x.DayOfWeek)
                .IsInEnum().WithMessage("DayOfWeek must be a valid day of the week.");

            schedule.RuleFor(x => x.StartTime)
                .NotEmpty().WithMessage("StartTime is required.")
                .Must(BeValidTime).WithMessage("StartTime must be between 00:00 and 23:59.");

            schedule.RuleFor(x => x.EndTime)
                .NotEmpty().WithMessage("EndTime is required.")
                .Must(BeValidTime).WithMessage("EndTime must be between 00:00 and 23:59.")
                .GreaterThan(x => x.StartTime).WithMessage("EndTime must be after StartTime.");
        });
    }

    private bool BeValidTime(TimeSpan time)
    {
        return time >= TimeSpan.Zero && time < TimeSpan.FromHours(24);
    }
}
