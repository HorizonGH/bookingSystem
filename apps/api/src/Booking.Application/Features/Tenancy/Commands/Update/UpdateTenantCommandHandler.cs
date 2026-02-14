using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Update;

public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, TenantDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {   
        var tenantRepo = _unitOfWork.WriteRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(request.Request.Id);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID {request.Request.Id} not found.");
        }

        TenantMapper.UpdateEntity(request.Request, tenant);
        tenant.LastModified = DateTime.UtcNow;

        tenantRepo.Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TenantMapper.ToDto(tenant);
    }
}