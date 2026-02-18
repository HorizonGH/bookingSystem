using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.WorkerSchedules.Commands.Delete;

public class DeleteWorkerScheduleCommandHandler : IRequestHandler<DeleteWorkerScheduleCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWorkerScheduleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteWorkerScheduleCommand request, CancellationToken cancellationToken)
    {
        // Get schedule with worker relationship
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedule = await scheduleRepo.GetAll([ws => ws.Worker])
            .FirstOrDefaultAsync(ws => ws.Id == request.ScheduleId, cancellationToken);

        if (schedule == null)
            throw new InvalidOperationException("Schedule not found");

        // Validate worker belongs to tenant
        if (schedule.Worker.TenantId != request.TenantId)
            throw new InvalidOperationException("Schedule does not belong to this tenant");

        // Delete schedule
        var writeRepo = _unitOfWork.WriteRepository<WorkerSchedule>();
        writeRepo.Remove(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
