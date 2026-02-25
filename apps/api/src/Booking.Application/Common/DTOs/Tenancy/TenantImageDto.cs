namespace Booking.Application.Common.DTOs.Tenancy;

public class TenantImageDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string PublicId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime Created { get; set; }
}
