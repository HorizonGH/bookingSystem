using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("Services");
        
        builder.HasKey(s => s.Id);
        
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(s => s.Description)
            .HasMaxLength(2000);
        
        builder.Property(s => s.Price)
            .HasPrecision(18, 2);
        
        builder.Property(s => s.ImageUrl)
            .HasMaxLength(500);
        
        builder.Property(s => s.Category)
            .HasMaxLength(100);
        
        builder.HasOne(s => s.Tenant)
            .WithMany(t => t.Services)
            .HasForeignKey(s => s.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(s => new { s.TenantId, s.Name });
    }
}
