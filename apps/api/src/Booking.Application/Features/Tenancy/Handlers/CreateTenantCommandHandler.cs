using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Features.Tenancy.Commands;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Handlers;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, TenantDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = TenantMapper.ToEntity(request.Request);
        tenant.Created = DateTime.UtcNow;

        await _unitOfWork.Repository<Tenant>().AddAsync(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TenantMapper.ToDto(tenant);
    }
}