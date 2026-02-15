using Booking.Application.Common.Pagination;
using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace Booking.WebApi.Binders;

/// <summary>
/// Custom request binder for PaginationRequest that parses filters from query parameters.
/// Supports query parameters in the format: filters.key=value
/// Example: /api/tenants?filters.name=Alice&filters.status=active
/// </summary>
public class PaginationRequestBinder : IRequestBinder<PaginationRequest>
{
    public async ValueTask<PaginationRequest> BindAsync(BinderContext ctx, CancellationToken ct)
    {
        var request = new PaginationRequest();
        var query = ctx.HttpContext.Request.Query;

        // Bind standard pagination properties
        if (query.TryGetValue("pageNumber", out var pageNumber) && int.TryParse(pageNumber, out var pn))
            request.PageNumber = pn;

        if (query.TryGetValue("pageSize", out var pageSize) && int.TryParse(pageSize, out var ps))
            request.PageSize = ps;

        if (query.TryGetValue("searchTerm", out var searchTerm))
            request.SearchTerm = searchTerm;

        if (query.TryGetValue("sortBy", out var sortBy))
            request.SortBy = sortBy;

        if (query.TryGetValue("sortDescending", out var sortDesc) && bool.TryParse(sortDesc, out var sd))
            request.SortDescending = sd;

        // Parse filters from query parameters with format: filters.key=value
        var filterParams = query.Where(q => q.Key.StartsWith("filters.", StringComparison.OrdinalIgnoreCase));
        
        if (filterParams.Any())
        {
            request.Filters = new Dictionary<string, object?>();
            
            foreach (var filterParam in filterParams)
            {
                // Extract the filter key by removing "filters." prefix
                var filterKey = filterParam.Key.Substring(8); // Remove "filters."
                
                // Handle the case-insensitive property matching by capitalizing first letter
                if (!string.IsNullOrEmpty(filterKey))
                {
                    // Capitalize first letter to match C# property naming convention
                    filterKey = char.ToUpper(filterKey[0]) + filterKey.Substring(1);
                    
                    var value = filterParam.Value.ToString();
                    
                    // Try to convert to appropriate types
                    if (bool.TryParse(value, out var boolVal))
                    {
                        request.Filters[filterKey] = boolVal;
                    }
                    else if (int.TryParse(value, out var intVal))
                    {
                        request.Filters[filterKey] = intVal;
                    }
                    else if (DateTime.TryParse(value, out var dateVal))
                    {
                        request.Filters[filterKey] = dateVal;
                    }
                    else if (Guid.TryParse(value, out var guidVal))
                    {
                        request.Filters[filterKey] = guidVal;
                    }
                    else
                    {
                        request.Filters[filterKey] = value;
                    }
                }
            }
        }

        return await ValueTask.FromResult(request);
    }
}
