namespace Booking.Application.Common.DTOs.Tenancy;

public class WorkerDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }
    
    // User information
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    // Worker information
    public string? JobTitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsAvailableForBooking { get; set; }
    
    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
}

public class CreateWorkerRequest
{
    public Guid UserId { get; set; }
    // TenantId is required when creating a worker: the caller (TenantAdmin) specifies which tenant
    public Guid TenantId { get; set; }
    public string? JobTitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsAvailableForBooking { get; set; } = true;
}

public class UpdateWorkerRequest
{
    public string? JobTitle { get; set; }
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsAvailableForBooking { get; set; }
}
