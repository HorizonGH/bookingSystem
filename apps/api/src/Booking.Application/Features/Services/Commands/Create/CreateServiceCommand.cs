using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Services.Commands.Create;

public class CreateServiceCommand : IRequest<ServiceDto>
{
    public CreateServiceRequest Request { get; set; } = null!;
    public Guid TenantId { get; set; }
}