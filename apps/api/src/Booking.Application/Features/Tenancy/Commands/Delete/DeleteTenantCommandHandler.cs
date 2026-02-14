using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Delete;

public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTenantCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        var tenantRepo = _unitOfWork.WriteRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(request.Id);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID {request.Id} not found.");
        }

        tenantRepo.Remove(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}