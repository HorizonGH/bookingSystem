using Booking.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Booking.Infrastructure.Persistence.Configurations;

public class WorkerScheduleConfiguration : IEntityTypeConfiguration<WorkerSchedule>
{
    public void Configure(EntityTypeBuilder<WorkerSchedule> builder)
    {
        builder.ToTable("WorkerSchedules");
        
        builder.HasKey(ws => ws.Id);
        
        builder.HasOne(ws => ws.Worker)
            .WithMany(w => w.WorkerSchedules)
            .HasForeignKey(ws => ws.WorkerId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(ws => new { ws.WorkerId, ws.DayOfWeek, ws.SpecificDate });
    }
}
