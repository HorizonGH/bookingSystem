using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Common.Pagination;
using Booking.Application.Features.Tenancy.Queries;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Queries.GetAll;

public class GetAllTenantsQueryHandler : IRequestHandler<GetAllTenantsQuery, PagedResult<TenantDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllTenantsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<TenantDto>> Handle(GetAllTenantsQuery request, CancellationToken cancellationToken)
    {
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var query = tenantRepo.GetAllFiltered(
            paginationRequest: request.Pagination,
            defaultSortExpression: t => t.Name,
            searchFields:
            [
                t => t.Name,
                t => t.Slug,
                t => t.Description ?? string.Empty,
                t => t.Email ?? string.Empty,
                t => t.City ?? string.Empty,
                t => t.Country ?? string.Empty
            ]);

        var pagedResult = await query.ToPagedResultAsync(
            request.Pagination.EffectivePageNumber,
            request.Pagination.EffectivePageSize,
            cancellationToken);

        return new PagedResult<TenantDto>
        {
            Items = pagedResult.Items.Select(TenantMapper.ToDto).ToList(),
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }
}