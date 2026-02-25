namespace Booking.Application.Common.Interfaces;

public interface ICloudinaryService
{
    /// <summary>
    /// Uploads an image stream to Cloudinary under the given folder.
    /// Returns (PublicId, SecureUrl).
    /// </summary>
    Task<(string PublicId, string Url)> UploadImageAsync(
        Stream imageStream,
        string fileName,
        string folder,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an asset from Cloudinary by its public_id.
    /// </summary>
    Task DeleteImageAsync(string publicId, CancellationToken cancellationToken = default);
}
