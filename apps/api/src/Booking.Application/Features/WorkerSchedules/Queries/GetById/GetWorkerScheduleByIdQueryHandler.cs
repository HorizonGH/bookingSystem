using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.WorkerSchedules.Queries.GetById;

public class GetWorkerScheduleByIdQueryHandler : IRequestHandler<GetWorkerScheduleByIdQuery, WorkerScheduleDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetWorkerScheduleByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkerScheduleDto?> Handle(GetWorkerScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedule = await scheduleRepo.GetAll([ws => ws.Worker])
            .FirstOrDefaultAsync(ws => ws.Id == request.ScheduleId, cancellationToken);

        if (schedule == null)
            return null;

        // Validate worker belongs to tenant
        if (schedule.Worker.TenantId != request.TenantId)
            throw new InvalidOperationException("Schedule does not belong to this tenant");

        return WorkerScheduleMapper.ToDto(schedule);
    }
}
