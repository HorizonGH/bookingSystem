using Booking.Application.Common.DTOs.Auth;
using MediatR;

namespace Booking.Application.Features.Auth.Queries.Me;

public record GetProfileInfoQuery :IRequest<GetProfileInfoResponse>
{
    //public Guid Id { get; set; }
}
