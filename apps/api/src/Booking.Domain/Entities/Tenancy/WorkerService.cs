namespace Booking.Domain.Entities.Tenancy;

public class WorkerService
{
    public Guid WorkerId { get; set; }
    public Guid ServiceId { get; set; }
    
    // Override service price for specific worker
    public decimal? CustomPrice { get; set; }
    
    // Navigation Properties
    public Worker Worker { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
