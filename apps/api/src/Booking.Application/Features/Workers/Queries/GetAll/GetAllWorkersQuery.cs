using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Pagination;
using MediatR;

namespace Booking.Application.Features.Workers.Queries.GetAll;

public class GetAllWorkersQuery : IRequest<PagedResult<WorkerDto>>
{
    public PaginationRequest Pagination { get; set; } = new();
}
