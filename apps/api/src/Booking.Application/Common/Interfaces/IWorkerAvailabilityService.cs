using Booking.Application.Common.DTOs.Tenancy;

namespace Booking.Application.Common.Interfaces;

public interface IWorkerAvailabilityService
{
    /// <summary>
    /// Checks if a worker is available for a specific time range
    /// </summary>
    Task<bool> IsWorkerAvailableAsync(Guid workerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available time slots for a worker on a specific date, optionally for a specific service
    /// </summary>
    Task<List<TimeSlotDto>> GetAvailableTimeSlotsAsync(Guid workerId, DateTime date, Guid? serviceId = null, int slotDurationMinutes = 60, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a proposed schedule would conflict with existing reservations
    /// </summary>
    Task<bool> HasScheduleConflictAsync(Guid workerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the effective schedule for a worker on a specific date (considers overrides)
    /// </summary>
    Task<List<WorkerScheduleDto>> GetEffectiveScheduleAsync(Guid workerId, DateTime date, CancellationToken cancellationToken = default);
}
