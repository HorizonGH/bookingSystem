using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Services.Commands.Create;

public class CreateServiceCommand : IRequest<ServiceDto>
{
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    public int BufferTimeBefore { get; set; } = 0;
    public int BufferTimeAfter { get; set; } = 0;
    public bool RequiresApproval { get; set; } = false;
    public int MaxAdvanceBookingDays { get; set; } = 30;
    public int MinAdvanceBookingHours { get; set; } = 1;
}