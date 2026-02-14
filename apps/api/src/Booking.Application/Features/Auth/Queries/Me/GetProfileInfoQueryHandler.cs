using System.Windows.Input;
using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Idendity;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Auth.Queries.Me;

public class GetProfileInfoQueryHandler : IRequestHandler<GetProfileInfoQuery, GetProfileInfoResponse>
{
        private readonly ICurrentUserService _currentUser;
        private readonly IUnitOfWork _unitOfWork;

    public GetProfileInfoQueryHandler(ICurrentUserService currentUser, IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<GetProfileInfoResponse> Handle(GetProfileInfoQuery request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.ReadRepository<User>();
        var reservationRepo = _unitOfWork.ReadRepository<Domain.Entities.Tenancy.Reservation>();

        if (!_currentUser.IsAuthenticated || !_currentUser.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        var userId =  _currentUser.UserId.Value;

        var user = await userRepo.GetByIdAsync(userId);
        var userReservations = await reservationRepo.GetAll().Where(r => r.ClientId == userId).ToListAsync(cancellationToken);

        return new GetProfileInfoResponse
        {
            Id = user!.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            TenantId = user.TenantId,
            //Role = user.Plan,
            Reservations = userReservations.Select(r => new ReservationDto
            {
                Id = r.Id,
                ClientId = r.ClientId,
                TenantId = r.TenantId,
                StartTime = r.StartTime,
                EndTime = r.EndTime,
                ReservationStatus = r.ReservationStatus
            }).ToList()
        };
    }

}
