using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Common.Pagination;

public static class QueryableExtensions
{
    // Filtering and Searching
    public static IQueryable<T> ApplyFilter<T>(
        this IQueryable<T> query,
        Expression<Func<T, bool>>? filter)
    {
        return filter != null ? query.Where(filter) : query;
    }

    public static IQueryable<T> SearchByFields<T>(
        this IQueryable<T> query,
        string? searchTerm,
        params Expression<Func<T, string>>[] searchFields)
    {
        if (string.IsNullOrWhiteSpace(searchTerm) || searchFields.Length == 0)
            return query;

        var parameter = Expression.Parameter(typeof(T), "x");
        Expression? combinedExpression = null;

        foreach (var field in searchFields)
        {
            var body = field.Body;
            if (body is MemberExpression memberExpression)
            {
                var replacedExpression = new ParameterReplacer(field.Parameters[0], parameter).Visit(memberExpression);
                
                var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) })!;
                var searchTermConstant = Expression.Constant(searchTerm, typeof(string));
                var containsCall = Expression.Call(replacedExpression, containsMethod, searchTermConstant);

                combinedExpression = combinedExpression == null
                    ? containsCall
                    : Expression.OrElse(combinedExpression, containsCall);
            }
        }

        if (combinedExpression != null)
        {
            var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
            query = query.Where(lambda);
        }

        return query;
    }

    public static IQueryable<T> ApplySorting<T>(
        this IQueryable<T> query,
        string? sortBy,
        bool ascending = true)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
            return query;

        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.Property(parameter, sortBy);
        var lambda = Expression.Lambda(property, parameter);

        var methodName = ascending ? "OrderBy" : "OrderByDescending";
        var resultExpression = Expression.Call(
            typeof(Queryable),
            methodName,
            new Type[] { typeof(T), property.Type },
            query.Expression,
            Expression.Quote(lambda));

        return query.Provider.CreateQuery<T>(resultExpression);
    }

    public static IQueryable<T> ApplyDynamicFilter<T>(
        this IQueryable<T> query,
        Dictionary<string, object?>? filters)
    {
        if (filters == null || !filters.Any())
            return query;

        var parameter = Expression.Parameter(typeof(T), "x");
        Expression? combinedExpression = null;

        foreach (var filter in filters)
        {
            if (filter.Value == null)
                continue;

            try
            {
                var property = Expression.Property(parameter, filter.Key);
                Expression filterExpression;

                // For string properties, use Contains for partial matching
                if (property.Type == typeof(string))
                {
                    var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) })!;
                    var constant = Expression.Constant(filter.Value.ToString(), typeof(string));
                    filterExpression = Expression.Call(property, containsMethod, constant);
                }
                else
                {
                    // For non-string properties, use exact equality
                    var constant = Expression.Constant(filter.Value);
                    filterExpression = Expression.Equal(property, Expression.Convert(constant, property.Type));
                }

                combinedExpression = combinedExpression == null
                    ? filterExpression
                    : Expression.AndAlso(combinedExpression, filterExpression);
            }
            catch
            {
                // Skip invalid property names
                continue;
            }
        }

        if (combinedExpression != null)
        {
            var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
            query = query.Where(lambda);
        }

        return query;
    }

    // Offset pagination
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<T>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    // Cursor-based pagination
    public static async Task<CursorPagedResult<T>> ToCursorPagedResultAsync<T, TKey>(
        this IQueryable<T> query,
        Expression<Func<T, TKey>> keySelector,
        string? cursor,
        int pageSize,
        PaginationDirection direction = PaginationDirection.Forward,
        CancellationToken cancellationToken = default) where TKey : IComparable<TKey>
    {
        var items = new List<T>();
        string? nextCursor = null;
        string? previousCursor = null;

        if (!string.IsNullOrEmpty(cursor))
        {
            var cursorValue = DecodeCursor<TKey>(cursor);
            
            if (direction == PaginationDirection.Forward)
            {
                query = query.Where(CreateGreaterThanExpression(keySelector, cursorValue));
            }
            else
            {
                query = query.Where(CreateLessThanExpression(keySelector, cursorValue));
            }
        }

        var hasExistingOrder = HasExistingOrder(query);
        
        if (direction == PaginationDirection.Forward)
        {
            if (!hasExistingOrder)
            {
                query = query.OrderBy(keySelector);
            }
        }
        else
        {
            if (!hasExistingOrder)
            {
                query = query.OrderByDescending(keySelector);
            }
        }

        // Get one extra item to check if there's a next page
        items = await query.Take(pageSize + 1).ToListAsync(cancellationToken);

        bool hasNextPage = items.Count > pageSize;
        bool hasPreviousPage = !string.IsNullOrEmpty(cursor);

        if (hasNextPage)
        {
            items.RemoveAt(items.Count - 1);
        }

        if (items.Any())
        {
            var keyCompiled = keySelector.Compile();
            
            if (direction == PaginationDirection.Forward)
            {
                nextCursor = hasNextPage ? EncodeCursor(keyCompiled(items.Last())) : null;
                previousCursor = hasPreviousPage ? EncodeCursor(keyCompiled(items.First())) : null;
            }
            else
            {
                items.Reverse();
                nextCursor = hasPreviousPage ? EncodeCursor(keyCompiled(items.Last())) : null;
                previousCursor = hasNextPage ? EncodeCursor(keyCompiled(items.First())) : null;
            }
        }

        return new CursorPagedResult<T>
        {
            Items = items,
            NextCursor = nextCursor,
            PreviousCursor = previousCursor,
            HasNextPage = hasNextPage,
            HasPreviousPage = hasPreviousPage,
            PageSize = pageSize
        };
    }

    private static bool HasExistingOrder<T>(IQueryable<T> query)
    {
        try
        {
            var expression = query.Expression;
            
            if (expression.Type.IsGenericType && 
                expression.Type.GetGenericTypeDefinition() == typeof(IOrderedQueryable<>))
            {
                return true;
            }
            
            var expressionString = expression.ToString();
            return expressionString.Contains("OrderBy") || expressionString.Contains("OrderByDescending");
        }
        catch
        {
            return false;
        }
    }

    private static Expression<Func<T, bool>> CreateGreaterThanExpression<T, TKey>(
        Expression<Func<T, TKey>> keySelector, TKey value)
    {
        var parameter = keySelector.Parameters[0];
        var property = keySelector.Body;
        var constant = Expression.Constant(value, typeof(TKey));
        var greaterThan = Expression.GreaterThan(property, constant);
        
        return Expression.Lambda<Func<T, bool>>(greaterThan, parameter);
    }

    private static Expression<Func<T, bool>> CreateLessThanExpression<T, TKey>(
        Expression<Func<T, TKey>> keySelector, TKey value)
    {
        var parameter = keySelector.Parameters[0];
        var property = keySelector.Body;
        var constant = Expression.Constant(value, typeof(TKey));
        var lessThan = Expression.LessThan(property, constant);
        
        return Expression.Lambda<Func<T, bool>>(lessThan, parameter);
    }

    private static string EncodeCursor<T>(T value)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(value);
        var bytes = System.Text.Encoding.UTF8.GetBytes(json);
        return Convert.ToBase64String(bytes);
    }

    private static T DecodeCursor<T>(string cursor)
    {
        var bytes = Convert.FromBase64String(cursor);
        var json = System.Text.Encoding.UTF8.GetString(bytes);
        return System.Text.Json.JsonSerializer.Deserialize<T>(json)!;
    }
}

// Helper class for expression parameter replacement
internal class ParameterReplacer : ExpressionVisitor
{
    private readonly ParameterExpression _oldParameter;
    private readonly ParameterExpression _newParameter;

    public ParameterReplacer(ParameterExpression oldParameter, ParameterExpression newParameter)
    {
        _oldParameter = oldParameter;
        _newParameter = newParameter;
    }

    protected override Expression VisitParameter(ParameterExpression node)
    {
        return node == _oldParameter ? _newParameter : base.VisitParameter(node);
    }
}