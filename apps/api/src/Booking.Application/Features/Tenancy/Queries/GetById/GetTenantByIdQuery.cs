using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Queries.GetById;

public class GetTenantByIdQuery : IRequest<TenantDto?>
{
    public Guid Id { get; set; }
}