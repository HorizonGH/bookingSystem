namespace Booking.Domain.Entities.Tenancy;

public class WorkerSchedule : Idendity.Entity
{
    public Guid WorkerId { get; set; }
    
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;
    
    // For specific date overrides (vacation, special hours)
    public DateTime? SpecificDate { get; set; }
    
    // Navigation Properties
    public Worker Worker { get; set; } = null!;
}
