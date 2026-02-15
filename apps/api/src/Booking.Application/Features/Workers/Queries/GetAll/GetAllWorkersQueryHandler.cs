using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Common.Pagination;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Workers.Queries.GetAll;

public class GetAllWorkersQueryHandler : IRequestHandler<GetAllWorkersQuery, PagedResult<WorkerDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllWorkersQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<WorkerDto>> Handle(GetAllWorkersQuery request, CancellationToken cancellationToken)
    {
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var query = workerRepo.GetAllFiltered(
            paginationRequest: request.Pagination,
            defaultSortExpression: w => w.Created,
            includes: [w => w.User],
            searchFields:
            [
                w => w.JobTitle ?? string.Empty,
                w => w.Bio ?? string.Empty,
                w => w.User.FirstName,
                w => w.User.LastName,
                w => w.User.Email
            ]);

        var pagedResult = await query.ToPagedResultAsync(
            request.Pagination.EffectivePageNumber,
            request.Pagination.EffectivePageSize,
            cancellationToken);

        return new PagedResult<WorkerDto>
        {
            Items = pagedResult.Items.Select(WorkerMapper.ToDto).ToList(),
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }
}
