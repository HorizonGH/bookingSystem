using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Reservations.Commands.Create;
using Booking.Domain.Entities.Tenancy;
using Riok.Mapperly.Abstractions;

namespace Booking.Application.Common.Mappers;

[Mapper]
public static partial class ReservationMapper
{
    [MapperIgnoreSource(nameof(Reservation.Tenant))]
    [MapperIgnoreSource(nameof(Reservation.Service))]
    [MapperIgnoreSource(nameof(Reservation.Worker))]
    [MapperIgnoreSource(nameof(Reservation.Client))]
    [MapperIgnoreSource(nameof(Reservation.StatusBaseEntity))]
    public static partial ReservationDto ToDto(Reservation reservation);

    [MapperIgnoreTarget(nameof(Reservation.Tenant))]
    [MapperIgnoreTarget(nameof(Reservation.Service))]
    [MapperIgnoreTarget(nameof(Reservation.Worker))]
    [MapperIgnoreTarget(nameof(Reservation.Client))]
    [MapperIgnoreTarget(nameof(Reservation.Id))]
    [MapperIgnoreTarget(nameof(Reservation.Created))]
    [MapperIgnoreTarget(nameof(Reservation.LastModified))]
    [MapperIgnoreTarget(nameof(Reservation.ReservationStatus))]
    [MapperIgnoreTarget(nameof(Reservation.CancellationReason))]
    [MapperIgnoreTarget(nameof(Reservation.CancelledAt))]
    [MapperIgnoreTarget(nameof(Reservation.ReminderSent))]
    [MapperIgnoreTarget(nameof(Reservation.ConfirmationSent))]
    [MapperIgnoreTarget(nameof(Reservation.StatusBaseEntity))]
    public static partial Reservation ToEntity(CreateReservationCommand request);

    [MapperIgnoreTarget(nameof(Reservation.Tenant))]
    [MapperIgnoreTarget(nameof(Reservation.Service))]
    [MapperIgnoreTarget(nameof(Reservation.Worker))]
    [MapperIgnoreTarget(nameof(Reservation.Client))]
    [MapperIgnoreTarget(nameof(Reservation.Id))]
    [MapperIgnoreTarget(nameof(Reservation.Created))]
    [MapperIgnoreTarget(nameof(Reservation.LastModified))]
    [MapperIgnoreTarget(nameof(Reservation.StatusBaseEntity))]
    [MapperIgnoreSource(nameof(UpdateReservationRequest.Id))]
    public static partial void UpdateEntity(UpdateReservationRequest request, Reservation reservation);
}