using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Create;

public class CreateTenantCommand : IRequest<TenantDto>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? BusinessHours { get; set; }
    public TimeSpan DefaultScheduleStartTime { get; set; } = new TimeSpan(9, 0, 0);
    public TimeSpan DefaultScheduleEndTime { get; set; } = new TimeSpan(18, 0, 0);
    public string AllowedScheduleDays { get; set; } = "1,2,3,4,5,6";
}