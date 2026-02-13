using MediatR;

namespace Booking.Application.Features.Tenancy.Commands;

public class DeleteTenantCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}