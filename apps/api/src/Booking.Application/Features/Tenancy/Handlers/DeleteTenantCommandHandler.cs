using Booking.Application.Common.Interfaces;
using Booking.Application.Features.Tenancy.Commands;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Handlers;

public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand, Unit>
{
    private readonly IReadRepository<Tenant> _readRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTenantCommandHandler(IReadRepository<Tenant> readRepository, IUnitOfWork unitOfWork)
    {
        _readRepository = readRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _readRepository.GetByIdAsync(request.Id);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID {request.Id} not found.");
        }

        _unitOfWork.Repository<Tenant>().Remove(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}