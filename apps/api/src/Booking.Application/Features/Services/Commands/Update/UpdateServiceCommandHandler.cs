using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Services.Commands.Update;

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, ServiceDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceDto> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var serviceRepo = _unitOfWork.ReadRepository<Service>();
        var service = await serviceRepo.GetByIdAsync(request.ServiceId);

        if (service == null)
            throw new InvalidOperationException("Service not found");

        // Update properties (only update fields provided)
        if (request.Request.Name is not null) service.Name = request.Request.Name;
        if (request.Request.Description is not null) service.Description = request.Request.Description;
        if (request.Request.DurationMinutes.HasValue) service.DurationMinutes = request.Request.DurationMinutes.Value;
        if (request.Request.Price.HasValue) service.Price = request.Request.Price.Value;
        if (request.Request.ImageUrl is not null) service.ImageUrl = request.Request.ImageUrl;
        if (request.Request.Category is not null) service.Category = request.Request.Category;
        if (request.Request.BufferTimeBefore.HasValue) service.BufferTimeBefore = request.Request.BufferTimeBefore.Value;
        if (request.Request.BufferTimeAfter.HasValue) service.BufferTimeAfter = request.Request.BufferTimeAfter.Value;
        if (request.Request.RequiresApproval.HasValue) service.RequiresApproval = request.Request.RequiresApproval.Value;
        if (request.Request.MaxAdvanceBookingDays.HasValue) service.MaxAdvanceBookingDays = request.Request.MaxAdvanceBookingDays.Value;
        if (request.Request.MinAdvanceBookingHours.HasValue) service.MinAdvanceBookingHours = request.Request.MinAdvanceBookingHours.Value;

        service.LastModified = DateTime.UtcNow;

        var writeRepo = _unitOfWork.WriteRepository<Service>();
        writeRepo.Update(service);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ServiceMapper.ToDto(service);
    }
}