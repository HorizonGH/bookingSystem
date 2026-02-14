using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Application.Common.Pagination;
using Booking.Application.Features.Reservations.Queries;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Reservations.Queries.GetAll;

public class GetAllReservationsQueryHandler : IRequestHandler<GetAllReservationsQuery, PagedResult<ReservationDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllReservationsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<ReservationDto>> Handle(GetAllReservationsQuery request, CancellationToken cancellationToken)
    {
        var reservationRepo = _unitOfWork.ReadRepository<Reservation>();
        var query = reservationRepo.GetAllFiltered(
            paginationRequest: request.Pagination,
            defaultSortExpression: r => r.StartTime,
            searchFields:
            [
                r => r.ClientName,
                r => r.ClientEmail,
                r => r.ClientPhone ?? string.Empty,
                r => r.Notes ?? string.Empty
            ]);

        var pagedResult = await query.ToPagedResultAsync(
            request.Pagination.EffectivePageNumber,
            request.Pagination.EffectivePageSize,
            cancellationToken);

        return new PagedResult<ReservationDto>
        {
            Items = pagedResult.Items.Select(ReservationMapper.ToDto).ToList(),
            TotalCount = pagedResult.TotalCount,
            PageNumber = pagedResult.PageNumber,
            PageSize = pagedResult.PageSize
        };
    }
}