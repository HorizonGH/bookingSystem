using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Features.Tenancy.Commands;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Handlers;

public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, TenantDto>
{
    private readonly IReadRepository<Tenant> _readRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantCommandHandler(IReadRepository<Tenant> readRepository, IUnitOfWork unitOfWork)
    {
        _readRepository = readRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _readRepository.GetByIdAsync(request.Request.Id);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID {request.Request.Id} not found.");
        }

        TenantMapper.UpdateEntity(request.Request, tenant);
        tenant.LastModified = DateTime.UtcNow;

        _unitOfWork.Repository<Tenant>().Update(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TenantMapper.ToDto(tenant);
    }
}