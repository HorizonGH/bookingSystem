using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Pagination;
using MediatR;

namespace Booking.Application.Features.Tenancy.Queries.GetAll;

public class GetAllTenantsQuery : IRequest<PagedResult<TenantDto>>
{
    public PaginationRequest Pagination { get; set; } = new();
}