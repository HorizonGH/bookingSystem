using Booking.Domain.Entities.Idendity;
using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Persistence;

public class BookingDbContext : DbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options)
    {
    }

    // Identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    
    // Tenancy
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<TenantPlan> TenantPlans => Set<TenantPlan>();
    public DbSet<Worker> Workers => Set<Worker>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<WorkerService> WorkerServices => Set<WorkerService>();
    public DbSet<WorkerSchedule> WorkerSchedules => Set<WorkerSchedule>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BookingDbContext).Assembly);
        
        // Global query filter for soft delete
        // Only apply to entities without many-to-many junction table complications
        modelBuilder.Entity<Tenant>().HasQueryFilter(e => e.StatusBaseEntity != Domain.Enums.StatusBaseEntity.Delete);
        modelBuilder.Entity<Plan>().HasQueryFilter(e => e.StatusBaseEntity != Domain.Enums.StatusBaseEntity.Delete);
        modelBuilder.Entity<TenantPlan>().HasQueryFilter(e => e.StatusBaseEntity != Domain.Enums.StatusBaseEntity.Delete);
        modelBuilder.Entity<WorkerSchedule>().HasQueryFilter(e => e.StatusBaseEntity != Domain.Enums.StatusBaseEntity.Delete);
        modelBuilder.Entity<Reservation>().HasQueryFilter(e => e.StatusBaseEntity != Domain.Enums.StatusBaseEntity.Delete);
        modelBuilder.Entity<RefreshToken>().HasQueryFilter(e => e.StatusBaseEntity != Domain.Enums.StatusBaseEntity.Delete);
        
        // Note: User, Role, Worker, and Service filters omitted to avoid EF Core warnings
        // with many-to-many relationships. Apply soft delete filtering in repositories/queries.
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<IEntity>();
        
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.Created = DateTime.UtcNow;
                entry.Entity.StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active;
            }
            
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModified = DateTime.UtcNow;
            }
        }
        
        return base.SaveChangesAsync(cancellationToken);
    }
}
