using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Pagination;
using MediatR;

namespace Booking.Application.Features.Reservations.Queries.GetAll;

public class GetAllReservationsQuery : IRequest<PagedResult<ReservationDto>>
{
    public PaginationRequest Pagination { get; set; } = new();
}