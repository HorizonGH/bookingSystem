using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("Reservations");
        
        builder.HasKey(r => r.Id);
        
        builder.Property(r => r.ClientName)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(r => r.ClientEmail)
            .IsRequired()
            .HasMaxLength(256);
        
        builder.Property(r => r.ClientPhone)
            .HasMaxLength(20);
        
        builder.Property(r => r.Price)
            .HasPrecision(18, 2);
        
        builder.Property(r => r.Notes)
            .HasMaxLength(2000);
        
        builder.Property(r => r.CancellationReason)
            .HasMaxLength(1000);
        
        builder.HasOne(r => r.Tenant)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(r => r.Service)
            .WithMany(s => s.Reservations)
            .HasForeignKey(r => r.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(r => r.Worker)
            .WithMany(w => w.Reservations)
            .HasForeignKey(r => r.WorkerId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(r => r.Client)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(r => new { r.TenantId, r.StartTime, r.EndTime });
        builder.HasIndex(r => new { r.WorkerId, r.StartTime });
        builder.HasIndex(r => r.ReservationStatus);
        
        // Prevent double-booking: unique constraint per worker + time slot for non-cancelled/non-deleted reservations
        builder.HasIndex(r => new { r.WorkerId, r.StartTime, r.EndTime })
            .IsUnique()
            .HasFilter("\"ReservationStatus\" != 2 AND \"StatusBaseEntity\" != 1")
            .HasDatabaseName("IX_Reservations_Worker_TimeSlot_NoCancelled");
    }
}
