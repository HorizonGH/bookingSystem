using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Delete;

public class DeleteTenantCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}