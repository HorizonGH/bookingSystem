using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.WorkerSchedules.Commands.Update;

public class UpdateWorkerScheduleCommandHandler : IRequestHandler<UpdateWorkerScheduleCommand, WorkerScheduleDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWorkerScheduleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkerScheduleDto> Handle(UpdateWorkerScheduleCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        var tenantId = request.TenantId;

        // Get schedule with worker relationship
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedule = await scheduleRepo.GetAll([ws => ws.Worker])
            .FirstOrDefaultAsync(ws => ws.Id == request.ScheduleId, cancellationToken);

        if (schedule == null)
            throw new InvalidOperationException("Schedule not found");

        // Validate worker belongs to tenant
        if (schedule.Worker.TenantId != tenantId)
            throw new InvalidOperationException("Schedule does not belong to this tenant");

        // Get tenant to validate schedule constraints
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(tenantId);
        
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found");

        // Validate schedule against tenant constraints
        ValidateScheduleAgainstTenantConstraints(req.DayOfWeek, req.StartTime, req.EndTime, tenant);

        // Check for schedule overlaps (excluding current schedule)
        var hasOverlap = await scheduleRepo.GetAll()
            .AnyAsync(ws => 
                ws.Id != request.ScheduleId &&
                ws.WorkerId == schedule.WorkerId &&
                ws.DayOfWeek == req.DayOfWeek &&
                ws.SpecificDate == req.SpecificDate &&
                (
                    (req.StartTime >= ws.StartTime && req.StartTime < ws.EndTime) ||
                    (req.EndTime > ws.StartTime && req.EndTime <= ws.EndTime) ||
                    (req.StartTime <= ws.StartTime && req.EndTime >= ws.EndTime)
                ),
                cancellationToken);

        if (hasOverlap)
            throw new InvalidOperationException(
                req.SpecificDate.HasValue
                    ? $"Worker already has a schedule for {req.SpecificDate.Value:yyyy-MM-dd} that overlaps with the requested time"
                    : $"Worker already has a recurring schedule for {req.DayOfWeek} that overlaps with the requested time");

        // Update schedule
        schedule.DayOfWeek = req.DayOfWeek;
        schedule.StartTime = req.StartTime;
        schedule.EndTime = req.EndTime;
        schedule.IsAvailable = req.IsAvailable;
        schedule.SpecificDate = req.SpecificDate;
        schedule.LastModified = DateTime.UtcNow;

        var writeRepo = _unitOfWork.WriteRepository<WorkerSchedule>();
        writeRepo.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return WorkerScheduleMapper.ToDto(schedule);
    }

    private void ValidateScheduleAgainstTenantConstraints(
        DayOfWeek dayOfWeek, 
        TimeSpan startTime, 
        TimeSpan endTime, 
        Tenant tenant)
    {
        // Check if day is allowed
        var allowedDays = tenant.AllowedScheduleDays
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(d => int.Parse(d.Trim()))
            .ToList();

        if (!allowedDays.Contains((int)dayOfWeek))
        {
            throw new InvalidOperationException(
                $"Schedule cannot be created for {dayOfWeek}. " +
                $"Tenant only allows schedules on: {string.Join(", ", allowedDays.Select(d => ((DayOfWeek)d).ToString()))}");
        }

        // Check if time is within tenant limits
        if (startTime < tenant.DefaultScheduleStartTime)
        {
            throw new InvalidOperationException(
                $"Schedule start time ({startTime}) cannot be before tenant's allowed start time ({tenant.DefaultScheduleStartTime})");
        }

        if (endTime > tenant.DefaultScheduleEndTime)
        {
            throw new InvalidOperationException(
                $"Schedule end time ({endTime}) cannot be after tenant's allowed end time ({tenant.DefaultScheduleEndTime})");
        }
    }
}
