using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Workers.Commands.Delete;

public class DeleteWorkerCommandHandler : IRequestHandler<DeleteWorkerCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWorkerCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteWorkerCommand request, CancellationToken cancellationToken)
    {
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var worker = await workerRepo.GetByIdAsync(request.WorkerId);

        if (worker == null)
            throw new InvalidOperationException("Worker not found");

        // Prevent deletion if this is the only worker (tenant owner)
        var totalWorkers = await workerRepo
            .GetAll()
            .Where(w => w.TenantId == worker.TenantId)
            .CountAsync(cancellationToken);

        if (totalWorkers <= 1)
            throw new InvalidOperationException("Cannot delete the last worker. Every tenant must have at least one worker.");

        // Update tenant plan worker count
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll()
            .Where(tp => tp.TenantId == worker.TenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan != null)
        {
            tenantPlan.CurrentWorkers = Math.Max(0, tenantPlan.CurrentWorkers - 1);
            var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();
            tenantPlanWriteRepo.Update(tenantPlan);
        }

        var writeRepo = _unitOfWork.WriteRepository<Worker>();
        writeRepo.Remove(worker);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
