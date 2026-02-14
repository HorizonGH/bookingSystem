using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Update;

public class UpdateTenantCommand : IRequest<TenantDto>
{
    public UpdateTenantRequest Request { get; set; } = new();
}