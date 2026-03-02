using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class PaymentSessionConfiguration : IEntityTypeConfiguration<PaymentSession>
{
    public void Configure(EntityTypeBuilder<PaymentSession> builder)
    {
        builder.ToTable("PaymentSessions");
        
        builder.HasKey(ps => ps.Id);
        
        builder.Property(ps => ps.ExpectedAmount)
            .HasPrecision(18, 2);
        
        builder.Property(ps => ps.Currency)
            .HasConversion<string>()
            .HasMaxLength(10);
        
        builder.Property(ps => ps.PaymentMethod)
            .HasConversion<string>()
            .HasMaxLength(20);
        
        builder.Property(ps => ps.Status)
            .HasConversion<string>()
            .HasMaxLength(30);
        
        builder.Property(ps => ps.ReferenceCode)
            .HasMaxLength(50);
        
        builder.HasOne(ps => ps.Tenant)
            .WithMany(t => t.PaymentSessions)
            .HasForeignKey(ps => ps.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(ps => ps.Plan)
            .WithMany()
            .HasForeignKey(ps => ps.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(ps => ps.Payment)
            .WithOne(p => p.PaymentSession)
            .HasForeignKey<Payment>(p => p.PaymentSessionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(ps => ps.TenantId);
        builder.HasIndex(ps => ps.ReferenceCode)
            .IsUnique()
            .HasFilter("\"ReferenceCode\" IS NOT NULL");
        builder.HasIndex(ps => ps.Status);
        builder.HasIndex(ps => ps.ExpiresAt);
    }
}
