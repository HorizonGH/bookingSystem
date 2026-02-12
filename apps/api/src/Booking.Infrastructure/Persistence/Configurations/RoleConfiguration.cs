using Booking.Domain.Entities.Idendity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.HasIndex(r => r.Name)
            .IsUnique();
        
        builder.Property(r => r.Description)
            .HasMaxLength(500);
        
        builder.Property(r => r.RoleType)
            .IsRequired();
        
        // Seed data
        builder.HasData(
            new Role
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = "SuperAdmin",
                Description = "Super Administrator with full system access",
                RoleType = Domain.Enums.RoleType.SuperAdmin,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            },
            new Role
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Name = "TenantAdmin",
                Description = "Tenant Administrator",
                RoleType = Domain.Enums.RoleType.TenantAdmin,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            },
            new Role
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Name = "Worker",
                Description = "Worker/Employee",
                RoleType = Domain.Enums.RoleType.Worker,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            },
            new Role
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                Name = "Client",
                Description = "Client/Customer",
                RoleType = Domain.Enums.RoleType.Client,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            }
        );
    }
}
