using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Images.Commands.Upload;

public class UploadTenantImageCommand : IRequest<TenantImageDto>
{
    public Guid TenantId { get; set; }
    public Stream ImageStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}
