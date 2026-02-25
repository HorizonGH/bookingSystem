using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Application.Common.Mappers;

public static class TenantImageMapper
{
    public static TenantImageDto ToDto(TenantImage image) => new()
    {
        Id = image.Id,
        TenantId = image.TenantId,
        PublicId = image.PublicId,
        Url = image.Url,
        AltText = image.AltText,
        DisplayOrder = image.DisplayOrder,
        IsPrimary = image.IsPrimary,
        Created = image.Created
    };

    public static IEnumerable<TenantImageDto> ToDtos(IEnumerable<TenantImage> images) =>
        images.Select(ToDto);
}
