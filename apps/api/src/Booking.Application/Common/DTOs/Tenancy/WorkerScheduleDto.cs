namespace Booking.Application.Common.DTOs.Tenancy;

public class WorkerScheduleDto
{
    public Guid Id { get; set; }
    public Guid WorkerId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime? SpecificDate { get; set; }
    public string ScheduleType => SpecificDate.HasValue ? "Override" : "Recurring";
    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
}

public class CreateWorkerScheduleRequest
{
    public Guid WorkerId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime? SpecificDate { get; set; }
}

public class UpdateWorkerScheduleRequest
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime? SpecificDate { get; set; }
}

public class BatchCreateWorkerScheduleRequest
{
    public Guid WorkerId { get; set; }
    public List<ScheduleEntry> Schedules { get; set; } = new();
}

public class ScheduleEntry
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;
}

public class TimeSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAvailable { get; set; }
}

public class AvailabilityQueryRequest
{
    public Guid WorkerId { get; set; }
    public Guid? ServiceId { get; set; }
    public DateTime Date { get; set; }
    public int? SlotDurationMinutes { get; set; }
}
