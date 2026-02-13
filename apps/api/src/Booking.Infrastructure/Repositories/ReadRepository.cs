using System.Linq.Expressions;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Pagination;
using Booking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Repositories;

public class ReadRepository<T> : IReadRepository<T> where T : class
{
    private readonly BookingDbContext _context;
    private readonly DbSet<T> _dbSet;

    public ReadRepository(BookingDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public T? GetById<TKey>(TKey id) => _dbSet.Find(id);

    public async Task<T?> GetByIdAsync<TKey>(TKey id) => await _dbSet.FindAsync(id);

    public T? First(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters)
        => QueryCore(includes, filters).FirstOrDefault();

    public async Task<T?> FirstAsync(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters)
        => await QueryCore(includes, filters).FirstOrDefaultAsync();

    public IQueryable<T> GetAll(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters)
        => QueryCore(includes, filters);

    public async Task<long> CountAsync(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters)
        => await QueryCore(includes, filters).CountAsync();

    public IQueryable<T> GetAllFiltered(
        PaginationRequest paginationRequest,
        Expression<Func<T, object>>? defaultSortExpression = null,
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        Expression<Func<T, bool>>[]? filters = null,
        Expression<Func<T, string>>[]? searchFields = null)
    {
        var query = QueryCore(includes, filters);

        // Apply dynamic filters from pagination request
        if (paginationRequest.Filters != null && paginationRequest.Filters.Any())
        {
            query = query.ApplyDynamicFilter(paginationRequest.Filters);
        }

        // Apply search from pagination request if search term and fields are provided
        if (!string.IsNullOrWhiteSpace(paginationRequest.SearchTerm) && searchFields != null && searchFields.Length > 0)
        {
            query = query.SearchByFields(paginationRequest.SearchTerm, searchFields);
        }

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(paginationRequest.SortBy))
        {
            query = query.ApplySorting(paginationRequest.SortBy, !paginationRequest.SortDescending);
        }
        else if (defaultSortExpression != null)
        {
            query = query.OrderBy(defaultSortExpression);
        }

        return query;
    }

    /// <summary>
    /// Core query builder that applies includes and base filters.
    /// All read methods funnel through this.
    /// </summary>
    protected virtual IQueryable<T> QueryCore(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters)
    {
        var queryable = _dbSet.AsNoTracking().AsQueryable();

        if (includes != null)
        {
            var includeArray = (includes as Expression<Func<T, object>>[]) ?? includes.ToArray();
            if (includeArray.Length > 0)
            {
                queryable = includeArray.Aggregate(queryable,
                    (current, include) => current.Include(include));
            }
        }

        if (filters != null && filters.Length > 0)
        {
            queryable = filters.Aggregate(queryable,
                (current, filter) => current.Where(filter));
        }

        return queryable;
    }
}