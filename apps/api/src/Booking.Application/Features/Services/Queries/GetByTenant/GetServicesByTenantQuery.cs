using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Enums;
using MediatR;

namespace Booking.Application.Features.Services.Queries.GetByTenant;

public class GetServicesByTenantQuery : IRequest<ServicesByTenantResponse>
{
    public Guid TenantId { get; set; }
}

public class ServicesByTenantResponse
{
    public List<ServiceDto> Services { get; set; } = new();
    public PlanType PlanType { get; set; }
    public int MaxServices { get; set; }
    public int CurrentServices { get; set; }
}