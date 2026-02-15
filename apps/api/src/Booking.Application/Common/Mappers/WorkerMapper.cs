using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Application.Common.Mappers;

public static class WorkerMapper
{
    public static WorkerDto ToDto(Worker worker)
    {
        return new WorkerDto
        {
            Id = worker.Id,
            UserId = worker.UserId,
            TenantId = worker.TenantId,
            FirstName = worker.User?.FirstName ?? string.Empty,
            LastName = worker.User?.LastName ?? string.Empty,
            Email = worker.User?.Email ?? string.Empty,
            PhoneNumber = worker.User?.PhoneNumber ?? string.Empty,
            JobTitle = worker.JobTitle,
            Bio = worker.Bio,
            ProfileImageUrl = worker.ProfileImageUrl,
            IsAvailableForBooking = worker.IsAvailableForBooking,
            Created = worker.Created,
            LastModified = worker.LastModified
        };
    }
}
