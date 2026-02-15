using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Workers.Queries.GetById;

public class GetWorkerByIdQueryHandler : IRequestHandler<GetWorkerByIdQuery, WorkerDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetWorkerByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkerDto> Handle(GetWorkerByIdQuery request, CancellationToken cancellationToken)
    {
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var worker = await workerRepo.GetAll([w => w.User])
            .FirstOrDefaultAsync(w => w.Id == request.WorkerId, cancellationToken);

        if (worker == null)
            throw new InvalidOperationException("Worker not found");

        return WorkerMapper.ToDto(worker);
    }
}
