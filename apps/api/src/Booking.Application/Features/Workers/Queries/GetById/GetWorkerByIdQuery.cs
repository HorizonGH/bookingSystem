using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Workers.Queries.GetById;

public class GetWorkerByIdQuery : IRequest<WorkerDto>
{
    public Guid WorkerId { get; set; }
}
