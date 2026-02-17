using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Application.Common.Mappers;

public static class ServiceMapper
{
    public static ServiceDto ToDto(Service service)
    {
        return new ServiceDto
        {
            Id = service.Id,
            TenantId = service.TenantId,
            Name = service.Name,
            Description = service.Description,
            DurationMinutes = service.DurationMinutes,
            Price = service.Price,
            ImageUrl = service.ImageUrl,
            Category = service.Category,
            BufferTimeBefore = service.BufferTimeBefore,
            BufferTimeAfter = service.BufferTimeAfter,
            RequiresApproval = service.RequiresApproval,
            MaxAdvanceBookingDays = service.MaxAdvanceBookingDays,
            MinAdvanceBookingHours = service.MinAdvanceBookingHours,
            Created = service.Created,
            LastModified = service.LastModified
        };
    }
}