using System.Data;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Reservations.Commands.Update;

public class UpdateReservationCommandHandler : IRequestHandler<UpdateReservationCommand, ReservationDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWorkerAvailabilityService _workerAvailabilityService;

    public UpdateReservationCommandHandler(IUnitOfWork unitOfWork, IWorkerAvailabilityService workerAvailabilityService)
    {
        _unitOfWork = unitOfWork;
        _workerAvailabilityService = workerAvailabilityService;
    }

    public async Task<ReservationDto> Handle(UpdateReservationCommand request, CancellationToken cancellationToken)
    {
        var reservationRepo = _unitOfWork.WriteRepository<Reservation>();
        var reservation = await reservationRepo.GetByIdAsync(request.Request.Id);
        if (reservation == null)
        {
            throw new KeyNotFoundException($"Reservation with ID {request.Request.Id} not found.");
        }

        var timeChanged = reservation.StartTime != request.Request.StartTime
                       || reservation.EndTime != request.Request.EndTime
                       || reservation.WorkerId != request.Request.WorkerId;

        if (timeChanged && request.Request.ReservationStatus != ReservationStatus.Cancelled)
        {
            // Validate worker schedule availability
            var isAvailable = await _workerAvailabilityService.IsWorkerAvailableAsync(
                request.Request.WorkerId, request.Request.StartTime, request.Request.EndTime, cancellationToken);

            if (!isAvailable)
                throw new InvalidOperationException(
                    "The worker is not available for the requested time slot.");

            // Serializable transaction to prevent race conditions
            await _unitOfWork.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
            try
            {
                // Re-check conflict inside transaction (exclude current reservation)
                var conflictRepo = _unitOfWork.ReadRepository<Reservation>();
                var hasConflict = await conflictRepo.GetAll(
                    filters: new System.Linq.Expressions.Expression<Func<Reservation, bool>>[]
                    {
                        r => r.WorkerId == request.Request.WorkerId,
                        r => r.Id != reservation.Id,
                        r => r.ReservationStatus != ReservationStatus.Cancelled,
                        r => r.StartTime < request.Request.EndTime && r.EndTime > request.Request.StartTime
                    }).AnyAsync(cancellationToken);

                if (hasConflict)
                    throw new InvalidOperationException(
                        "The requested time slot was just booked by another user. Please select a different time.");

                ReservationMapper.UpdateEntity(request.Request, reservation);
                reservation.LastModified = DateTime.UtcNow;

                reservationRepo.Update(reservation);
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

        ReservationMapper.UpdateEntity(request.Request, reservation);
        reservation.LastModified = DateTime.UtcNow;

        reservationRepo.Update(reservation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ReservationMapper.ToDto(reservation);
    }
}