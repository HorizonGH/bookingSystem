using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Features.Tenancy.Queries;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Queries.GetById;

public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, TenantDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    public GetTenantByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto?> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(request.Id);
        
        if (tenant == null)
        {
            return null;
        }

        return MapToDto(tenant);
    }

    private static TenantDto MapToDto(Tenant tenant)
    {
        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Slug = tenant.Slug,
            Description = tenant.Description,
            LogoUrl = tenant.LogoUrl,
            Website = tenant.Website,
            Email = tenant.Email,
            PhoneNumber = tenant.PhoneNumber,
            Address = tenant.Address,
            City = tenant.City,
            State = tenant.State,
            Country = tenant.Country,
            PostalCode = tenant.PostalCode,
            BusinessHours = tenant.BusinessHours,
            Created = tenant.Created,
            LastModified = tenant.LastModified
        };
    }
}