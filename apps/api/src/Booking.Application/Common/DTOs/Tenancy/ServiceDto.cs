using System;
using System.ComponentModel.DataAnnotations;

namespace Booking.Application.Common.DTOs.Tenancy;

public class ServiceDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }

    // Buffer times
    public int BufferTimeBefore { get; set; }
    public int BufferTimeAfter { get; set; }

    // Booking settings
    public bool RequiresApproval { get; set; }
    public int MaxAdvanceBookingDays { get; set; }
    public int MinAdvanceBookingHours { get; set; }

    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
}

public class CreateServiceRequest
{
    public Guid TenantId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }

    public int BufferTimeBefore { get; set; } = 0;
    public int BufferTimeAfter { get; set; } = 0;

    public bool RequiresApproval { get; set; } = false;
    public int MaxAdvanceBookingDays { get; set; } = 30;
    public int MinAdvanceBookingHours { get; set; } = 1;
}

public class UpdateServiceRequest
{
    [Required]
    public Guid Id { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal? Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? Category { get; set; }

    public int? BufferTimeBefore { get; set; }
    public int? BufferTimeAfter { get; set; }

    public bool? RequiresApproval { get; set; }
    public int? MaxAdvanceBookingDays { get; set; }
    public int? MinAdvanceBookingHours { get; set; }
}