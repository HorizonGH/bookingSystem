using System.Text.RegularExpressions;

namespace Booking.Application.Common.Utilities;

public static class SlugGenerator
{
    public static string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Convert to lowercase
        var slug = input.ToLowerInvariant();

        // Replace spaces and underscores with hyphens
        slug = Regex.Replace(slug, @"[\s_]+", "-");

        // Remove invalid characters (keep only letters, numbers, and hyphens)
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove multiple consecutive hyphens
        slug = Regex.Replace(slug, @"-+", "-");

        // Remove leading and trailing hyphens
        slug = slug.Trim('-');

        return slug;
    }

    public static string GenerateUniqueSlug(string baseSlug, Func<string, bool> slugExists)
    {
        var slug = baseSlug;
        var counter = 1;

        while (slugExists(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }
}