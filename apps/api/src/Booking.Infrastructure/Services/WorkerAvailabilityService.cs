using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Services;

using Microsoft.Extensions.Logging;

public class WorkerAvailabilityService : IWorkerAvailabilityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<WorkerAvailabilityService> _logger;

    public WorkerAvailabilityService(IUnitOfWork unitOfWork, ILogger<WorkerAvailabilityService> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<bool> IsWorkerAvailableAsync(Guid workerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        startTime = startTime.Kind == DateTimeKind.Utc ? startTime : DateTime.SpecifyKind(startTime.ToUniversalTime(), DateTimeKind.Utc);
        endTime = endTime.Kind == DateTimeKind.Utc ? endTime : DateTime.SpecifyKind(endTime.ToUniversalTime(), DateTimeKind.Utc);

        _logger.LogDebug("Checking availability for worker {WorkerId} from {StartTime} to {EndTime}", workerId, startTime, endTime);

        if (startTime >= endTime)
        {
            _logger.LogWarning("Invalid time range for worker {WorkerId}: start {StartTime} >= end {EndTime}", workerId, startTime, endTime);
            return false;
        }

        var date = startTime.Date;
        var dayOfWeek = date.DayOfWeek;

        // Get schedules for the date (specific date overrides take precedence)
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedules = await scheduleRepo.GetAll()
            .Where(ws => ws.WorkerId == workerId &&
                        ws.IsAvailable &&
                        (ws.SpecificDate == date || (ws.DayOfWeek == dayOfWeek && !ws.SpecificDate.HasValue)))
            .ToListAsync(cancellationToken);

        // Check for specific date schedule first (overrides)
        var specificDateSchedules = schedules.Where(s => s.SpecificDate.HasValue).ToList();
        var recurringSchedules = schedules.Where(s => !s.SpecificDate.HasValue).ToList();

        var effectiveSchedules = specificDateSchedules.Any() ? specificDateSchedules : recurringSchedules;

        if (!effectiveSchedules.Any())
        {
            _logger.LogInformation("Worker {WorkerId} has no schedule entries for {Date}", workerId, date);
            return false; // Worker has no schedule for this date
        }

        var requestedStartTime = startTime.TimeOfDay;
        var requestedEndTime = endTime.TimeOfDay;

        _logger.LogDebug("Worker {WorkerId} schedule candidates: {Schedules}", workerId, effectiveSchedules.Select(s => new { s.StartTime, s.EndTime, s.SpecificDate }).ToList());

        var isWithinSchedule = effectiveSchedules.Any(s =>
            requestedStartTime >= s.StartTime &&
            requestedEndTime <= s.EndTime);

        if (!isWithinSchedule)
        {
            _logger.LogInformation("Worker {WorkerId} requested slot {StartTime}–{EndTime} outside schedule for {Date}", workerId, startTime, endTime, date);
            return false; // Requested time is outside worker's schedule
        }

        var hasConflict = await HasScheduleConflictAsync(workerId, startTime, endTime, cancellationToken);

        if (hasConflict)
            _logger.LogInformation("Worker {WorkerId} has existing reservation conflict for slot {StartTime}–{EndTime}", workerId, startTime, endTime);

        return !hasConflict;
    }

    public async Task<List<TimeSlotDto>> GetAvailableTimeSlotsAsync(
        Guid workerId, 
        DateTime date, 
        Guid? serviceId = null, 
        int slotDurationMinutes = 60, 
        CancellationToken cancellationToken = default)
    {
        var dateUtc = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var dayOfWeek = dateUtc.DayOfWeek;

        // Get service if provided (for duration and buffer times)
        Service? service = null;
        if (serviceId.HasValue)
        {
            var serviceRepo = _unitOfWork.ReadRepository<Service>();
            service = await serviceRepo.GetByIdAsync(serviceId.Value);
        }

        // Get schedules for the date
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedules = await scheduleRepo.GetAll()
            .Where(ws => ws.WorkerId == workerId &&
                        ws.IsAvailable &&
                        (ws.SpecificDate == dateUtc || (ws.DayOfWeek == dayOfWeek && !ws.SpecificDate.HasValue)))
            .ToListAsync(cancellationToken);

        // Prioritize specific date schedules
        var specificDateSchedules = schedules.Where(s => s.SpecificDate.HasValue).ToList();
        var recurringSchedules = schedules.Where(s => !s.SpecificDate.HasValue).ToList();
        
        var effectiveSchedules = specificDateSchedules.Any() ? specificDateSchedules : recurringSchedules;

        if (!effectiveSchedules.Any())
            return new List<TimeSlotDto>();

        // Get existing reservations for the date
        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var reservations = await reservationRepo.GetAll()
            .Where(r => r.WorkerId == workerId &&
                       r.StartTime.Date == dateUtc &&
                       r.ReservationStatus != ReservationStatus.Cancelled)
            .ToListAsync(cancellationToken);

        // Determine slot duration and buffers
        var slotDuration = service?.DurationMinutes ?? slotDurationMinutes;
        var bufferBefore = service?.BufferTimeBefore ?? 0;
        var bufferAfter = service?.BufferTimeAfter ?? 0;
        var totalSlotDuration = slotDuration + bufferBefore + bufferAfter;

        // Generate time slots
        var timeSlots = new List<TimeSlotDto>();

        foreach (var schedule in effectiveSchedules)
        {
            var currentTime = schedule.StartTime;
            var endTime = schedule.EndTime;

            while (currentTime + TimeSpan.FromMinutes(slotDuration) <= endTime)
            {
                var slotStart = dateUtc.Add(currentTime);
                var slotEnd = slotStart.AddMinutes(slotDuration);
                var slotWithBuffer = slotStart.AddMinutes(-bufferBefore);
                var slotEndWithBuffer = slotEnd.AddMinutes(bufferAfter);

                // Check if slot conflicts with existing reservations
                var hasConflict = reservations.Any(r =>
                    (slotWithBuffer >= r.StartTime && slotWithBuffer < r.EndTime) ||
                    (slotEndWithBuffer > r.StartTime && slotEndWithBuffer <= r.EndTime) ||
                    (slotWithBuffer <= r.StartTime && slotEndWithBuffer >= r.EndTime));

                timeSlots.Add(new TimeSlotDto
                {
                    StartTime = slotStart,
                    EndTime = slotEnd,
                    IsAvailable = !hasConflict
                });

                currentTime = currentTime.Add(TimeSpan.FromMinutes(totalSlotDuration));
            }
        }

        return timeSlots.OrderBy(ts => ts.StartTime).ToList();
    }

    public async Task<bool> HasScheduleConflictAsync(Guid workerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        
        var hasConflict = await reservationRepo.GetAll()
            .AnyAsync(r => r.WorkerId == workerId &&
                          r.ReservationStatus != ReservationStatus.Cancelled &&
                          (
                              (startTime >= r.StartTime && startTime < r.EndTime) ||
                              (endTime > r.StartTime && endTime <= r.EndTime) ||
                              (startTime <= r.StartTime && endTime >= r.EndTime)
                          ),
                     cancellationToken);

        _logger.LogDebug("Conflict check for worker {WorkerId}, slot {StartTime}-{EndTime}: {HasConflict}", workerId, startTime, endTime, hasConflict);
        return hasConflict;
    }

    public async Task<List<WorkerScheduleDto>> GetEffectiveScheduleAsync(Guid workerId, DateTime date, CancellationToken cancellationToken = default)
    {
        var dateUtc = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var dayOfWeek = dateUtc.DayOfWeek;

        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedules = await scheduleRepo.GetAll()
            .Where(ws => ws.WorkerId == workerId &&
                        (ws.SpecificDate == dateUtc || (ws.DayOfWeek == dayOfWeek && !ws.SpecificDate.HasValue)))
            .ToListAsync(cancellationToken);

        // Specific date schedules override recurring ones
        var specificDateSchedules = schedules.Where(s => s.SpecificDate.HasValue).ToList();
        var recurringSchedules = schedules.Where(s => !s.SpecificDate.HasValue).ToList();

        var effectiveSchedules = specificDateSchedules.Any() ? specificDateSchedules : recurringSchedules;

        return WorkerScheduleMapper.ToDtoList(effectiveSchedules);
    }
}
