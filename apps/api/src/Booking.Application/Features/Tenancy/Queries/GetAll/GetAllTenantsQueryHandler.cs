using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Common.Pagination;
using Booking.Application.Features.Tenancy.Queries;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

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
                t => t.Description,
                t => t.Email,
                t => t.City,
                t => t.Country
            ])
            .Include(t => t.Images); // eager load for primary image lookup

        var pagedResult = await query.ToPagedResultAsync(
            request.Pagination.EffectivePageNumber,
            request.Pagination.EffectivePageSize,
            cancellationToken);

        var items = pagedResult.Items.Select(t =>
        {
            var dto = TenantMapper.ToDto(t);
            dto.PrimaryImageUrl = t.Images
                .FirstOrDefault(i => i.IsPrimary)?.Url;
            return dto;
        }).ToList();

        return new PagedResult<TenantDto>
        {
            Items = items,
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }
}