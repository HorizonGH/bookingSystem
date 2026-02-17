using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Services.Queries.GetById;

public class GetServiceByIdQuery : IRequest<ServiceDto?>
{
    public Guid Id { get; set; }
}