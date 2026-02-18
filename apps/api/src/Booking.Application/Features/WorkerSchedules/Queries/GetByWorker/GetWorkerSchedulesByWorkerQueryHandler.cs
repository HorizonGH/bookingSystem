using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.WorkerSchedules.Queries.GetByWorker;

public class GetWorkerSchedulesByWorkerQueryHandler : IRequestHandler<GetWorkerSchedulesByWorkerQuery, List<WorkerScheduleDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetWorkerSchedulesByWorkerQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<WorkerScheduleDto>> Handle(GetWorkerSchedulesByWorkerQuery request, CancellationToken cancellationToken)
    {
        // Validate worker exists and belongs to tenant
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var worker = await workerRepo.GetByIdAsync(request.WorkerId);
        
        if (worker == null)
            throw new InvalidOperationException("Worker not found");
        
        if (worker.TenantId != request.TenantId)
            throw new InvalidOperationException("Worker does not belong to this tenant");

        // Get schedules
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var query = scheduleRepo.GetAll()
            .Where(ws => ws.WorkerId == request.WorkerId);

        // Filter by date if provided
        if (request.Date.HasValue)
        {
            var dateUtc = DateTime.SpecifyKind(request.Date.Value.Date, DateTimeKind.Utc);
            var dayOfWeek = dateUtc.DayOfWeek;
            query = query.Where(ws => 
                (ws.SpecificDate == dateUtc) || 
                (ws.DayOfWeek == dayOfWeek && !ws.SpecificDate.HasValue));
        }

        // Filter inactive schedules
        if (!request.IncludeInactive)
        {
            query = query.Where(ws => ws.IsAvailable);
        }

        var schedules = await query
            .OrderBy(ws => ws.SpecificDate.HasValue ? 0 : 1) // Specific dates first
            .ThenBy(ws => ws.DayOfWeek)
            .ThenBy(ws => ws.StartTime)
            .ToListAsync(cancellationToken);

        return WorkerScheduleMapper.ToDtoList(schedules);
    }
}
