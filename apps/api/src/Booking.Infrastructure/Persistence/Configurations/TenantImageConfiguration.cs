using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class TenantImageConfiguration : IEntityTypeConfiguration<TenantImage>
{
    public void Configure(EntityTypeBuilder<TenantImage> builder)
    {
        builder.ToTable("TenantImages");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.PublicId)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(i => i.AltText)
            .HasMaxLength(300);

        builder.Property(i => i.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(i => i.IsPrimary)
            .HasDefaultValue(false);

        builder.HasOne(i => i.Tenant)
            .WithMany(t => t.Images)
            .HasForeignKey(i => i.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => i.TenantId);
        builder.HasIndex(i => i.PublicId).IsUnique();
    }
}
