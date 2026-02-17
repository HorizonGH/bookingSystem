using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Services.Commands.Delete;

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteServiceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var serviceRepo = _unitOfWork.ReadRepository<Service>();
        var service = await serviceRepo.GetByIdAsync(request.ServiceId);

        if (service == null)
            throw new InvalidOperationException("Service not found");

        // Prevent deletion if there are existing reservations for this service
        var reservationRepo = _unitOfWork.ReadRepository<Booking.Domain.Entities.Tenancy.Reservation>();
        var hasReservations = await reservationRepo.GetAll()
            .AnyAsync(r => r.ServiceId == service.Id, cancellationToken);

        if (hasReservations)
            throw new InvalidOperationException("Cannot delete service with existing reservations.");

        // Update tenant plan service count
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll()
            .Where(tp => tp.TenantId == service.TenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan != null)
        {
            tenantPlan.CurrentServices = Math.Max(0, tenantPlan.CurrentServices - 1);
            var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();
            tenantPlanWriteRepo.Update(tenantPlan);
        }

        var writeRepo = _unitOfWork.WriteRepository<Service>();
        writeRepo.Remove(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}