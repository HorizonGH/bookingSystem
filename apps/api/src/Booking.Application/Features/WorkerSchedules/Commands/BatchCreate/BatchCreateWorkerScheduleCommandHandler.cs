using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.WorkerSchedules.Commands.BatchCreate;

public class BatchCreateWorkerScheduleCommandHandler : IRequestHandler<BatchCreateWorkerScheduleCommand, List<WorkerScheduleDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public BatchCreateWorkerScheduleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<WorkerScheduleDto>> Handle(BatchCreateWorkerScheduleCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        var tenantId = request.TenantId;

        // Validate worker exists and belongs to tenant
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var worker = await workerRepo.GetByIdAsync(req.WorkerId);
        
        if (worker == null)
            throw new InvalidOperationException("Worker not found");
        
        if (worker.TenantId != tenantId)
            throw new InvalidOperationException("Worker does not belong to this tenant");

        // Get tenant to validate schedule constraints
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(tenantId);
        
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found");

        // Get existing schedules for overlap checking
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var existingSchedules = await scheduleRepo.GetAll()
            .Where(ws => ws.WorkerId == req.WorkerId)
            .ToListAsync(cancellationToken);

        var schedulesToCreate = new List<WorkerSchedule>();

        foreach (var scheduleEntry in req.Schedules)
        {
            // Validate against tenant constraints
            ValidateScheduleAgainstTenantConstraints(scheduleEntry.DayOfWeek, scheduleEntry.StartTime, scheduleEntry.EndTime, tenant);

            // Check for overlaps with existing schedules
            var hasOverlap = existingSchedules.Any(existing =>
                existing.DayOfWeek == scheduleEntry.DayOfWeek &&
                !existing.SpecificDate.HasValue && // Only check recurring schedules
                (
                    (scheduleEntry.StartTime >= existing.StartTime && scheduleEntry.StartTime < existing.EndTime) ||
                    (scheduleEntry.EndTime > existing.StartTime && scheduleEntry.EndTime <= existing.EndTime) ||
                    (scheduleEntry.StartTime <= existing.StartTime && scheduleEntry.EndTime >= existing.EndTime)
                ));

            if (hasOverlap)
                throw new InvalidOperationException(
                    $"Worker already has a recurring schedule for {scheduleEntry.DayOfWeek} that overlaps with the requested time");

            // Check for overlaps within the batch
            var hasInternalOverlap = schedulesToCreate.Any(s =>
                s.DayOfWeek == scheduleEntry.DayOfWeek &&
                (
                    (scheduleEntry.StartTime >= s.StartTime && scheduleEntry.StartTime < s.EndTime) ||
                    (scheduleEntry.EndTime > s.StartTime && scheduleEntry.EndTime <= s.EndTime) ||
                    (scheduleEntry.StartTime <= s.StartTime && scheduleEntry.EndTime >= s.EndTime)
                ));

            if (hasInternalOverlap)
                throw new InvalidOperationException(
                    $"Duplicate or overlapping schedules found for {scheduleEntry.DayOfWeek} in the batch");

            schedulesToCreate.Add(new WorkerSchedule
            {
                WorkerId = req.WorkerId,
                DayOfWeek = scheduleEntry.DayOfWeek,
                StartTime = scheduleEntry.StartTime,
                EndTime = scheduleEntry.EndTime,
                IsAvailable = scheduleEntry.IsAvailable,
                SpecificDate = null, // Batch creates are for recurring schedules
                Created = DateTime.UtcNow
            });
        }

        // Add all schedules
        var writeRepo = _unitOfWork.WriteRepository<WorkerSchedule>();
        foreach (var schedule in schedulesToCreate)
        {
            await writeRepo.AddAsync(schedule);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return WorkerScheduleMapper.ToDtoList(schedulesToCreate);
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
