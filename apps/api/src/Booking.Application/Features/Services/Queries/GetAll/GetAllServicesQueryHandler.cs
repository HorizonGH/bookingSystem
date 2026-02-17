using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Common.Pagination;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Services.Queries.GetAll;

public class GetAllServicesQueryHandler : IRequestHandler<GetAllServicesQuery, PagedResult<ServiceDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllServicesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ServiceDto>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
    {
        var serviceRepo = _unitOfWork.ReadRepository<Service>();
        var query = serviceRepo.GetAllFiltered(
            paginationRequest: request.Pagination,
            defaultSortExpression: s => s.Name,
            searchFields:
            [
                s => s.Name,
                s => s.Description ?? string.Empty,
                s => s.Category ?? string.Empty
            ]);

        var pagedResult = await query.ToPagedResultAsync(
            request.Pagination.EffectivePageNumber,
            request.Pagination.EffectivePageSize,
            cancellationToken);

        return new PagedResult<ServiceDto>
        {
            Items = pagedResult.Items.Select(ServiceMapper.ToDto).ToList(),
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }
}