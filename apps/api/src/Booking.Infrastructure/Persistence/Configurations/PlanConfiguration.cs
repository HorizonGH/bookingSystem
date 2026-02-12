using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(p => p.Description)
            .HasMaxLength(1000);
        
        builder.Property(p => p.Price)
            .HasPrecision(18, 2);
        
        builder.Property(p => p.BillingCycle)
            .HasMaxLength(50);
        
        // Seed data
        builder.HasData(
            new Plan
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Name = "Free",
                Description = "Free plan for testing",
                PlanType = Domain.Enums.PlanType.Free,
                Price = 0,
                BillingCycle = "Monthly",
                MaxWorkers = 1,
                MaxServices = 3,
                MaxReservationsPerMonth = 50,
                HasCustomBranding = false,
                HasAnalytics = false,
                HasApiAccess = false,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            },
            new Plan
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Name = "Basic",
                Description = "Basic plan for small businesses",
                PlanType = Domain.Enums.PlanType.Basic,
                Price = 20.00m,
                BillingCycle = "Monthly",
                MaxWorkers = 3,
                MaxServices = 10,
                MaxReservationsPerMonth = 200,
                HasCustomBranding = false,
                HasAnalytics = true,
                HasApiAccess = false,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            },
            new Plan
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Name = "Professional",
                Description = "Professional plan for growing businesses",
                PlanType = Domain.Enums.PlanType.Professional,
                Price = 50.00m,
                BillingCycle = "Monthly",
                MaxWorkers = 20,
                MaxServices = 50,
                MaxReservationsPerMonth = -1,
                HasCustomBranding = true,
                HasAnalytics = true,
                HasApiAccess = true,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            },
            new Plan
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Name = "Enterprise",
                Description = "Enterprise plan for large businesses",
                PlanType = Domain.Enums.PlanType.Enterprise,
                Price = 100.00m,
                BillingCycle = "Monthly",
                MaxWorkers = -1, // Unlimited
                MaxServices = -1, // Unlimited
                MaxReservationsPerMonth = -1, // Unlimited
                HasCustomBranding = true,
                HasAnalytics = true,
                HasApiAccess = true,
                Created = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StatusBaseEntity = Domain.Enums.StatusBaseEntity.Active
            }
        );
    }
}
