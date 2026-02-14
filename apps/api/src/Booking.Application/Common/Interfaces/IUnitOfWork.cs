namespace Booking.Application.Common.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IWriteRepository<T> WriteRepository<T>() where T : class;
    IReadRepository<T> ReadRepository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}