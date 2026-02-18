using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Application.Common.Mappers;

public static class WorkerScheduleMapper
{
    public static WorkerScheduleDto ToDto(WorkerSchedule schedule)
    {
        return new WorkerScheduleDto
        {
            Id = schedule.Id,
            WorkerId = schedule.WorkerId,
            DayOfWeek = schedule.DayOfWeek,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            IsAvailable = schedule.IsAvailable,
            SpecificDate = schedule.SpecificDate,
            Created = schedule.Created,
            LastModified = schedule.LastModified
        };
    }

    public static List<WorkerScheduleDto> ToDtoList(IEnumerable<WorkerSchedule> schedules)
    {
        return schedules.Select(ToDto).ToList();
    }
}
