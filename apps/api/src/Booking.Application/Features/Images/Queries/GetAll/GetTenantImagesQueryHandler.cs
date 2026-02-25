using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Images.Queries.GetAll;

public class GetTenantImagesQueryHandler : IRequestHandler<GetTenantImagesQuery, IEnumerable<TenantImageDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTenantImagesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TenantImageDto>> Handle(GetTenantImagesQuery request, CancellationToken cancellationToken)
    {
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenantExists = await tenantRepo.GetAll()
            .AnyAsync(t => t.Id == request.TenantId, cancellationToken);

        if (!tenantExists)
            throw new InvalidOperationException("Tenant not found");

        var imageRepo = _unitOfWork.ReadRepository<TenantImage>();
        var images = await imageRepo.GetAll()
            .Where(i => i.TenantId == request.TenantId)
            .OrderBy(i => i.DisplayOrder)
            .ThenBy(i => i.Created)
            .ToListAsync(cancellationToken);

        return TenantImageMapper.ToDtos(images);
    }
}
