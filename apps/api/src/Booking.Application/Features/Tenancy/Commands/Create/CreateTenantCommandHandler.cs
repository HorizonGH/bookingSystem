using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Create;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, TenantDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = TenantMapper.ToEntity(request);
        tenant.Created = DateTime.UtcNow;

        var tenantRepo = _unitOfWork.WriteRepository<Tenant>();
        await tenantRepo.AddAsync(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TenantMapper.ToDto(tenant);
    }
}