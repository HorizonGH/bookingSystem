using System;

namespace Booking.Application.Common.DTOs.Tenancy;

public class TenantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? Website { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? BusinessHours { get; set; }
    
    // Default Schedule Constraints
    public TimeSpan DefaultScheduleStartTime { get; set; }
    public TimeSpan DefaultScheduleEndTime { get; set; }
    public string AllowedScheduleDays { get; set; } = string.Empty;
    
    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
}