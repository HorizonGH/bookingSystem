using System.Collections.Concurrent;
using System.Data;
using Booking.Application.Common.Interfaces;
using Booking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Booking.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly BookingDbContext _context;
    // Separate caches for read vs write repositories to avoid returning the wrong implementation
    private readonly ConcurrentDictionary<Type, object> _readRepositories = new();
    private readonly ConcurrentDictionary<Type, object> _writeRepositories = new();
    private IDbContextTransaction? _currentTransaction;
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

    public async Task BeginTransactionAsync(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default)
    {
        if (_currentTransaction is null)
        {
            _currentTransaction = await _context.Database.BeginTransactionAsync(isolationLevel, cancellationToken);
        }
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction is null)
            throw new InvalidOperationException("No active transaction to commit.");

        await _currentTransaction.CommitAsync(cancellationToken);
        await _currentTransaction.DisposeAsync();
        _currentTransaction = null;
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction is null) return;

        await _currentTransaction.RollbackAsync(cancellationToken);
        await _currentTransaction.DisposeAsync();
        _currentTransaction = null;
    }

    public async Task ExecuteInTransactionAsync(Func<Task> operation, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default)
    {
        var strategy = _context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(isolationLevel, cancellationToken);
            try
            {
                await operation();
                await transaction.CommitAsync(cancellationToken);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        });
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
            _currentTransaction?.Dispose();
            _context.Dispose();
        }
        _disposed = true;
    }
}