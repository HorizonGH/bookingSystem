using System.Collections.Concurrent;
using Booking.Application.Common.Interfaces;
using Booking.Infrastructure.Persistence;

namespace Booking.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly BookingDbContext _context;
    // Separate caches for read vs write repositories to avoid returning the wrong implementation
    private readonly ConcurrentDictionary<Type, object> _readRepositories = new();
    private readonly ConcurrentDictionary<Type, object> _writeRepositories = new();
    private bool _disposed;

    public UnitOfWork(BookingDbContext context)
    {
        _context = context;
    }

    public IWriteRepository<T> WriteRepository<T>() where T : class
    {
        return (IWriteRepository<T>)_writeRepositories.GetOrAdd(
            typeof(T),
            _ => new WriteRepository<T>(_context));
    }

    public IReadRepository<T> ReadRepository<T>() where T : class
    {
        return (IReadRepository<T>)_readRepositories.GetOrAdd(
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