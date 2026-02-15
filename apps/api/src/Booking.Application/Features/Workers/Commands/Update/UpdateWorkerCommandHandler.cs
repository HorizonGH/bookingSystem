using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Workers.Commands.Update;

public class UpdateWorkerCommandHandler : IRequestHandler<UpdateWorkerCommand, WorkerDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWorkerCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<WorkerDto> Handle(UpdateWorkerCommand request, CancellationToken cancellationToken)
    {
        var workerRepo = _unitOfWork.ReadRepository<Worker>();
        var worker = await workerRepo.GetAll([w => w.User])
            .FirstOrDefaultAsync(w => w.Id == request.WorkerId, cancellationToken);

        if (worker == null)
            throw new InvalidOperationException("Worker not found");

        // Update worker properties
        worker.JobTitle = request.Request.JobTitle;
        worker.Bio = request.Request.Bio;
        worker.ProfileImageUrl = request.Request.ProfileImageUrl;
        worker.IsAvailableForBooking = request.Request.IsAvailableForBooking;
        worker.LastModified = DateTime.UtcNow;

        var writeRepo = _unitOfWork.WriteRepository<Worker>();
        writeRepo.Update(worker);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return WorkerMapper.ToDto(worker);
    }
}
