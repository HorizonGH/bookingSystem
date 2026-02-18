using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.WorkerSchedules.Queries.GetAvailableTimeSlots;

public class GetAvailableTimeSlotsQueryHandler : IRequestHandler<GetAvailableTimeSlotsQuery, List<TimeSlotDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAvailableTimeSlotsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TimeSlotDto>> Handle(GetAvailableTimeSlotsQuery request, CancellationToken cancellationToken)
    {
        // Validate worker exists and belongs to tenant
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var worker = await workerRepo.GetByIdAsync(request.WorkerId);
        
        if (worker == null)
            throw new InvalidOperationException("Worker not found");
        
        if (worker.TenantId != request.TenantId)
            throw new InvalidOperationException("Worker does not belong to this tenant");

        // Get service if provided (for duration and buffer times)
        Service? service = null;
        if (request.ServiceId.HasValue)
        {
            var serviceRepo = _unitOfWork.ReadRepository<Service>();
            service = await serviceRepo.GetByIdAsync(request.ServiceId.Value);
            
            if (service == null)
                throw new InvalidOperationException("Service not found");
            
            if (service.TenantId != request.TenantId)
                throw new InvalidOperationException("Service does not belong to this tenant");
        }

        var date = DateTime.SpecifyKind(request.Date.Date, DateTimeKind.Utc);
        var dayOfWeek = date.DayOfWeek;

        // Get schedules for the date (specific date overrides take precedence)
        var scheduleRepo = _unitOfWork.ReadRepository<WorkerSchedule>();
        var schedules = await scheduleRepo.GetAll()
            .Where(ws => ws.WorkerId == request.WorkerId &&
                        ws.IsAvailable &&
                        (ws.SpecificDate == date || (ws.DayOfWeek == dayOfWeek && !ws.SpecificDate.HasValue)))
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
            .Where(r => r.WorkerId == request.WorkerId &&
                       r.StartTime.Date == date &&
                       r.ReservationStatus != Domain.Enums.ReservationStatus.Cancelled)
            .ToListAsync(cancellationToken);

        // Determine slot duration
        var slotDuration = service?.DurationMinutes ?? request.SlotDurationMinutes;
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
                var slotStart = date.Add(currentTime);
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
}
