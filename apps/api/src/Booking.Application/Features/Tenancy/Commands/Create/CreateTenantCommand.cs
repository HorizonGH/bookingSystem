using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Commands.Create;

public class CreateTenantCommand : IRequest<TenantDto>
{
    public CreateTenantRequest Request { get; set; } = new();
}