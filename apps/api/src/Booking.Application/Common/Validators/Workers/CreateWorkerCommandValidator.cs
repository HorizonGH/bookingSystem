using Booking.Application.Features.Workers.Commands.Create;
using FastEndpoints;
using FluentValidation;

namespace Booking.Application.Common.Validators.Workers;

public class CreateWorkerCommandValidator : Validator<CreateWorkerCommand>
{
    public CreateWorkerCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.");

        RuleFor(x => x.JobTitle)
            .MaximumLength(200).WithMessage("Job title must not exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.JobTitle));

        RuleFor(x => x.Bio)
            .MaximumLength(1000).WithMessage("Bio must not exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Bio));

        RuleFor(x => x.ProfileImageUrl)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .When(x => !string.IsNullOrEmpty(x.ProfileImageUrl))
            .WithMessage("Profile image URL must be a valid URL.");
    }
}
