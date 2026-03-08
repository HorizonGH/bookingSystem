using System.Data;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Commands.Create;

public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IWorkerAvailabilityService _workerAvailabilityService;

    public CreateReservationCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IWorkerAvailabilityService workerAvailabilityService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _workerAvailabilityService = workerAvailabilityService;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        //Validate worker schedule availability (includes conflict check)
        var isAvailable = await _workerAvailabilityService.IsWorkerAvailableAsync(
            request.WorkerId, request.StartTime, request.EndTime, cancellationToken);

        if (!isAvailable)
            throw new InvalidOperationException(
                "The worker is not available for the requested time slot. " +
                "The time may be outside the worker's schedule or already booked.");

        //— Serializable transaction to prevent race conditions
        await _unitOfWork.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        try
        {
            // Re-check conflict inside transaction to prevent concurrent bookings
            var hasConflict = await _workerAvailabilityService.HasScheduleConflictAsync(
                request.WorkerId, request.StartTime, request.EndTime, cancellationToken);

            if (hasConflict)
                throw new InvalidOperationException(
                    "The requested time slot was just booked by another user. Please select a different time.");

            var reservation = ReservationMapper.ToEntity(request);
            reservation.Created = DateTime.UtcNow;
            reservation.ClientId = _currentUserService.UserId!.Value;

            var reservationRepo = _unitOfWork.WriteRepository<Reservation>();
            await reservationRepo.AddAsync(reservation);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            return ReservationMapper.ToDto(reservation);
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}