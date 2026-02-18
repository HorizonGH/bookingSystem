using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");
        
        builder.HasKey(t => t.Id);
        
        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(t => t.Slug)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.HasIndex(t => t.Slug)
            .IsUnique();
        
        builder.Property(t => t.Email)
            .IsRequired()
            .HasMaxLength(256);
        
        builder.Property(t => t.PhoneNumber)
            .HasMaxLength(20);
        
        builder.Property(t => t.Description)
            .HasMaxLength(1000);
        
        builder.Property(t => t.Website)
            .HasMaxLength(500);
        
        builder.Property(t => t.LogoUrl)
            .HasMaxLength(500);
        
        builder.Property(t => t.Address)
            .HasMaxLength(500);
        
        builder.Property(t => t.City)
            .HasMaxLength(100);
        
        builder.Property(t => t.State)
            .HasMaxLength(100);
        
        builder.Property(t => t.Country)
            .HasMaxLength(100);
        
        builder.Property(t => t.PostalCode)
            .HasMaxLength(20);
        
        builder.Property(t => t.BusinessHours)
            .HasMaxLength(2000);
        
        // Default Schedule Constraints
        builder.Property(t => t.DefaultScheduleStartTime)
            .IsRequired()
            .HasDefaultValue(new TimeSpan(9, 0, 0));
        
        builder.Property(t => t.DefaultScheduleEndTime)
            .IsRequired()
            .HasDefaultValue(new TimeSpan(18, 0, 0));
        
        builder.Property(t => t.AllowedScheduleDays)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("1,2,3,4,5,6"); // Monday-Saturday
    }
}
