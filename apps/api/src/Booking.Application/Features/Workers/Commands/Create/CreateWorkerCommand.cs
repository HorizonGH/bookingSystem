using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Workers.Commands.Create;

public class CreateWorkerCommand : IRequest<WorkerDto>
{
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    public string? JobTitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsAvailableForBooking { get; set; } = true;
}
