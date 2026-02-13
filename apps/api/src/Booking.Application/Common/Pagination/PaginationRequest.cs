namespace Booking.Application.Common.Pagination;

/// <summary>
/// Unified pagination request class containing pagination, filtering, sorting, and search parameters.
/// Use this across all query endpoints to provide consistent filtering, sorting, and pagination.
/// </summary>
public class PaginationRequest
{
    // Pagination
    public int? PageNumber { get; set; }
    public int? PageSize { get; set; }

    // Searching
    public string? SearchTerm { get; set; }

    // Sorting
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;

    // Filtering - supports generic key-value filters for flexible filtering across different entities
    public Dictionary<string, object?>? Filters { get; set; }

    public int EffectivePageNumber => PageNumber.GetValueOrDefault(1);
    public int EffectivePageSize => PageSize.GetValueOrDefault(10);

    /// <summary>
    /// Gets a filter value by key, with optional type checking for reference types
    /// </summary>
    /// <typeparam name="T">The expected type of the filter value (reference type)</typeparam>
    /// <param name="key">The filter key</param>
    /// <returns>The filter value cast to type T, or null if not found or cannot be cast</returns>
    public T? GetFilterValue<T>(string key) where T : class
    {
        if (Filters == null || !Filters.TryGetValue(key, out var value))
            return null;

        return value as T;
    }

    /// <summary>
    /// Gets a filter value and converts it to a nullable value type
    /// </summary>
    /// <typeparam name="T">The expected type of the filter value (value type)</typeparam>
    /// <param name="key">The filter key</param>
    /// <returns>The filter value converted to type T, or null if not found or cannot be converted</returns>
    public T? GetFilterValueAs<T>(string key) where T : struct
    {
        if (Filters == null || !Filters.TryGetValue(key, out var value))
            return null;

        if (value is T typed)
            return typed;

        if (value == null)
            return null;

        try
        {
            return (T)Convert.ChangeType(value, typeof(T));
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Checks if a filter key exists
    /// </summary>
    /// <param name="key">The filter key to check</param>
    /// <returns>True if the filter exists, false otherwise</returns>
    public bool HasFilter(string key) => Filters != null && Filters.ContainsKey(key);
}

/// <summary>
/// Cursor-based pagination request with filtering, sorting, and search support
/// </summary>
public class CursorPaginationRequest
{
    public string? Cursor { get; set; }
    public int? PageSize { get; set; }
    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public PaginationDirection Direction { get; set; } = PaginationDirection.Forward;
    public Dictionary<string, object?>? Filters { get; set; }

    public int EffectivePageSize => PageSize.GetValueOrDefault(10);

    /// <summary>
    /// Gets a filter value by key, with optional type checking for reference types
    /// </summary>
    /// <typeparam name="T">The expected type of the filter value (reference type)</typeparam>
    /// <param name="key">The filter key</param>
    /// <returns>The filter value cast to type T, or null if not found or cannot be cast</returns>
    public T? GetFilterValue<T>(string key) where T : class
    {
        if (Filters == null || !Filters.TryGetValue(key, out var value))
            return null;

        return value as T;
    }

    /// <summary>
    /// Gets a filter value and converts it to a nullable value type
    /// </summary>
    /// <typeparam name="T">The expected type of the filter value (value type)</typeparam>
    /// <param name="key">The filter key</param>
    /// <returns>The filter value converted to type T, or null if not found or cannot be converted</returns>
    public T? GetFilterValueAs<T>(string key) where T : struct
    {
        if (Filters == null || !Filters.TryGetValue(key, out var value))
            return null;

        if (value is T typed)
            return typed;

        if (value == null)
            return null;

        try
        {
            return (T)Convert.ChangeType(value, typeof(T));
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Checks if a filter key exists
    /// </summary>
    /// <param name="key">The filter key to check</param>
    /// <returns>True if the filter exists, false otherwise</returns>
    public bool HasFilter(string key) => Filters != null && Filters.ContainsKey(key);
}