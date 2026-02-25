namespace Booking.Domain.Entities.Tenancy;

public class TenantImage : Idendity.Entity
{
    public Guid TenantId { get; set; }

    /// <summary>Cloudinary public_id used to manage/delete the asset.</summary>
    public string PublicId { get; set; } = string.Empty;

    /// <summary>Cloudinary secure URL.</summary>
    public string Url { get; set; } = string.Empty;

    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;

    // Navigation Properties
    public Tenant Tenant { get; set; } = null!;
}
