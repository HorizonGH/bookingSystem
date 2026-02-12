using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class WorkerServiceConfiguration : IEntityTypeConfiguration<WorkerService>
{
    public void Configure(EntityTypeBuilder<WorkerService> builder)
    {
        builder.ToTable("WorkerServices");
        
        builder.HasKey(ws => new { ws.WorkerId, ws.ServiceId });
        
        builder.Property(ws => ws.CustomPrice)
            .HasPrecision(18, 2);
        
        builder.HasOne(ws => ws.Worker)
            .WithMany(w => w.WorkerServices)
            .HasForeignKey(ws => ws.WorkerId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(ws => ws.Service)
            .WithMany(s => s.WorkerServices)
            .HasForeignKey(ws => ws.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
