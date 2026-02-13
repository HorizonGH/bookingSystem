using System.Linq.Expressions;
using Booking.Application.Common.Pagination;

namespace Booking.Application.Common.Interfaces;

public interface IReadRepository<T> where T : class
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
    Task<long> CountAsync(
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        params Expression<Func<T, bool>>[]? filters);
    IQueryable<T> GetAllFiltered(
        PaginationRequest paginationRequest,
        Expression<Func<T, object>>? defaultSortExpression = null,
        IEnumerable<Expression<Func<T, object>>>? includes = null,
        Expression<Func<T, bool>>[]? filters = null,
        Expression<Func<T, string>>[]? searchFields = null);
}