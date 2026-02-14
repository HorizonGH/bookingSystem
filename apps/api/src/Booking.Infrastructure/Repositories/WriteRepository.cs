using System.Linq.Expressions;
using Booking.Application.Common.Interfaces;
using Booking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Repositories;

public class WriteRepository<T> : IWriteRepository<T> where T : class
{
    private readonly BookingDbContext _context;
    private readonly DbSet<T> _dbSet;

    public WriteRepository(BookingDbContext context)
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


    public async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
    {
        await _dbSet.AddRangeAsync(entities);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void UpdateRange(IEnumerable<T> entities)
    {
        _dbSet.UpdateRange(entities);
    }

    public void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

    public void RemoveRange(IEnumerable<T> entities)
    {
        _dbSet.RemoveRange(entities);
    }


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