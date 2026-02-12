using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class WorkerConfiguration : IEntityTypeConfiguration<Worker>
{
    public void Configure(EntityTypeBuilder<Worker> builder)
    {
        builder.ToTable("Workers");
        
        builder.HasKey(w => w.Id);
        
        builder.Property(w => w.JobTitle)
            .HasMaxLength(100);
        
        builder.Property(w => w.Bio)
            .HasMaxLength(1000);
        
        builder.Property(w => w.ProfileImageUrl)
            .HasMaxLength(500);
        
        builder.HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(w => w.Tenant)
            .WithMany(t => t.Workers)
            .HasForeignKey(w => w.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(w => new { w.TenantId, w.UserId })
            .IsUnique();
    }
}
