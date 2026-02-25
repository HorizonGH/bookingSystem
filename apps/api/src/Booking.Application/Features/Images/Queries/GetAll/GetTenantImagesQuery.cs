using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Images.Queries.GetAll;

public class GetTenantImagesQuery : IRequest<IEnumerable<TenantImageDto>>
{
    public Guid TenantId { get; set; }
}
