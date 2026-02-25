using MediatR;

namespace Booking.Application.Features.Images.Commands.Delete;

public class DeleteTenantImageCommand : IRequest<bool>
{
    public Guid ImageId { get; set; }
    public Guid TenantId { get; set; }
}
