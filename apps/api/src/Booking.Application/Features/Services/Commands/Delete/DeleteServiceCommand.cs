using MediatR;

namespace Booking.Application.Features.Services.Commands.Delete;

public class DeleteServiceCommand : IRequest<bool>
{
    public Guid ServiceId { get; set; }
}