namespace Booking.Application.Common.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IWriteRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}