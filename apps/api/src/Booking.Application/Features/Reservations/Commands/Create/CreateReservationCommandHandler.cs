using System.Data;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Create;

using Microsoft.Extensions.Logging;

public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IWorkerAvailabilityService _workerAvailabilityService;
    private readonly ILogger<CreateReservationCommandHandler> _logger;

    public CreateReservationCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IWorkerAvailabilityService workerAvailabilityService,
        ILogger<CreateReservationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _workerAvailabilityService = workerAvailabilityService;
        _logger = logger;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        // Normalize input times to UTC and log candidate slot
        var requestedStart = request.StartTime.Kind == DateTimeKind.Utc
            ? request.StartTime
            : request.StartTime.ToUniversalTime();
        var requestedEnd = request.EndTime.Kind == DateTimeKind.Utc
            ? request.EndTime
            : request.EndTime.ToUniversalTime();

        _logger.LogInformation("CreateReservation request for worker {WorkerId} from {StartTimeUtc} to {EndTimeUtc}",
            request.WorkerId, requestedStart, requestedEnd);

        // Compute EndTime from service duration (ignore incoming EndTime if provided)
        var serviceRepo = _unitOfWork.ReadRepository<Service>();
        var service = await serviceRepo.GetByIdAsync(request.ServiceId);
        if (service == null)
            throw new KeyNotFoundException("Service not found.");

        var computedEnd = requestedStart.AddMinutes(service.DurationMinutes);
        _logger.LogInformation("Computed end time from service {ServiceId} duration {Duration} minutes: {ComputedEnd}",
            request.ServiceId, service.DurationMinutes, computedEnd);

        if (computedEnd <= requestedStart)
            throw new InvalidOperationException("Invalid service duration or start time. End time must be after start time.");

        var isAvailable = await _workerAvailabilityService.IsWorkerAvailableAsync(
            request.WorkerId, requestedStart, computedEnd, cancellationToken);

        if (!isAvailable)
        {
            _logger.LogWarning("Worker {WorkerId} unavailable for slot {StartTimeUtc}-{EndTimeUtc}",
                request.WorkerId, requestedStart, computedEnd);
            throw new InvalidOperationException(
                "The worker is not available for the requested time slot. " +
                "The time may be outside the worker's schedule or already booked.");
        }

        //— Serializable transaction to prevent race conditions with retry strategy support
        ReservationDto? result = null;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            // Re-check conflict inside transaction to prevent concurrent bookings
            var hasConflict = await _workerAvailabilityService.HasScheduleConflictAsync(
                request.WorkerId, requestedStart, computedEnd, cancellationToken);

            if (hasConflict)
                throw new InvalidOperationException(
                    "The requested time slot was just booked by another user. Please select a different time.");

            // Update request with computed end time so the mapper persists it
            request.EndTime = computedEnd;

            var reservation = ReservationMapper.ToEntity(request);
            reservation.Created = DateTime.UtcNow;
            reservation.ClientId = _currentUserService.UserId!.Value;

            var reservationRepo = _unitOfWork.WriteRepository<Reservation>();
            await reservationRepo.AddAsync(reservation);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            result = ReservationMapper.ToDto(reservation);
        }, IsolationLevel.Serializable, cancellationToken);

        if (result == null)
            throw new InvalidOperationException("Reservation creation failed unexpectedly.");

        return result;
    }
}