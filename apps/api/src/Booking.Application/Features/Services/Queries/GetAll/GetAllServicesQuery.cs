using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Pagination;
using MediatR;

namespace Booking.Application.Features.Services.Queries.GetAll;

public class GetAllServicesQuery : IRequest<PagedResult<ServiceDto>>
{
    public PaginationRequest Pagination { get; set; } = new();
}