using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class TenantPlanConfiguration : IEntityTypeConfiguration<TenantPlan>
{
    public void Configure(EntityTypeBuilder<TenantPlan> builder)
    {
        builder.ToTable("TenantPlans");
        
        builder.HasKey(tp => tp.Id);
        
        builder.Property(tp => tp.CurrentPrice)
            .HasPrecision(18, 2);
        
        builder.HasOne(tp => tp.Tenant)
            .WithMany(t => t.TenantPlans)
            .HasForeignKey(tp => tp.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(tp => tp.Plan)
            .WithMany(p => p.TenantPlans)
            .HasForeignKey(tp => tp.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(tp => new { tp.TenantId, tp.SubscriptionStatus });
    }
}
