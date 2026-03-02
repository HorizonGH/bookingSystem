using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("Payments");
        
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Amount)
            .HasPrecision(18, 2);
        
        builder.Property(p => p.Currency)
            .HasConversion<string>()
            .HasMaxLength(10);
        
        builder.Property(p => p.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.Property(p => p.Status)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.Property(p => p.SenderName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(p => p.ScreenshotUrl)
            .IsRequired()
            .HasMaxLength(1000);
        
        builder.Property(p => p.ScreenshotPublicId)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(p => p.TransactionNumber)
            .HasMaxLength(100);
        
        builder.Property(p => p.ConfirmationNumber)
            .HasMaxLength(100);
        
        builder.Property(p => p.AdminNotes)
            .HasMaxLength(1000);
        
        builder.HasOne(p => p.Tenant)
            .WithMany(t => t.Payments)
            .HasForeignKey(p => p.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.PaymentSessionId).IsUnique();
        builder.HasIndex(p => p.Status);
        
        // Anti-fraud: unique transaction numbers for Transfermóvil
        builder.HasIndex(p => p.TransactionNumber)
            .IsUnique()
            .HasFilter("\"TransactionNumber\" IS NOT NULL");
        
        // Anti-fraud: unique confirmation numbers for Zelle
        builder.HasIndex(p => p.ConfirmationNumber)
            .IsUnique()
            .HasFilter("\"ConfirmationNumber\" IS NOT NULL");
    }
}
