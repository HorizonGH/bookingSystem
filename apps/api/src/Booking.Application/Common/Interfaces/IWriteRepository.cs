using System.Linq.Expressions;

namespace Booking.Application.Common.Interfaces;

public interface IWriteRepository<T> where T : class
{
    T? GetById<TKey>(TKey id);
    Task<T?> GetByIdAsync<TKey>(TKey id);
    T? First(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters);
    Task<T?> FirstAsync(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters);
    IQueryable<T> GetAll(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters);


    Task AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    void Update(T entity);
    void UpdateRange(IEnumerable<T> entities);
    void Remove(T entity);
    void RemoveRange(IEnumerable<T> entities);
}