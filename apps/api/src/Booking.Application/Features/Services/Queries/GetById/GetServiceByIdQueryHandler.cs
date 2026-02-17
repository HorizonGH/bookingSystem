using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;

namespace Booking.Application.Features.Services.Queries.GetById;

public class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ServiceDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetServiceByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceDto?> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var serviceRepo = _unitOfWork.ReadRepository<Service>();
        var service = await serviceRepo.GetByIdAsync(request.Id);

        if (service is null)
            throw new KeyNotFoundException($"Service with ID {request.Id} not found.");

        return ServiceMapper.ToDto(service);
    }
}