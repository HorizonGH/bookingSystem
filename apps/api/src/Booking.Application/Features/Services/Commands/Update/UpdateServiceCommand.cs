using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Services.Commands.Update;

public class UpdateServiceCommand : IRequest<ServiceDto>
{
    public Guid ServiceId { get; set; }
    public UpdateServiceRequest Request { get; set; } = null!;
}