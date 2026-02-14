using System.Collections.Concurrent;
using Booking.Application.Common.Interfaces;
using Booking.Infrastructure.Persistence;

namespace Booking.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly BookingDbContext _context;
    private readonly ConcurrentDictionary<Type, object> _repositories = new();
    private bool _disposed;

    public UnitOfWork(BookingDbContext context)
    {
        _context = context;
    }

    public IWriteRepository<T> WriteRepository<T>() where T : class
    {
        return (IWriteRepository<T>)_repositories.GetOrAdd(
            typeof(T),
            _ => new WriteRepository<T>(_context));
    }

    public IReadRepository<T> ReadRepository<T>() where T : class
    {
        return (IReadRepository<T>)_repositories.GetOrAdd(
            typeof(T),
            _ => new ReadRepository<T>(_context));
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _context.Dispose();
        }
        _disposed = true;
    }

    
}