using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Enums;
using MediatR;

namespace Booking.Application.Features.Workers.Queries.GetByTenant;

public class GetWorkersByTenantQuery : IRequest<WorkersByTenantResponse>
{
    public Guid TenantId { get; set; }
}

public class WorkersByTenantResponse
{
    public List<WorkerDto> Workers { get; set; } = new();
    public PlanType PlanType { get; set; }
    public bool IsSingleWorkerOnly { get; set; } // True for Free plan with only 1 worker
    public int MaxWorkers { get; set; }
    public int CurrentWorkers { get; set; }
}
