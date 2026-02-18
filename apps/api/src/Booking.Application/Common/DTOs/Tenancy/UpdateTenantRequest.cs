using System;
using System.ComponentModel.DataAnnotations;

namespace Booking.Application.Common.DTOs.Tenancy;

public class UpdateTenantRequest
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    [RegularExpression(@"^[a-z0-9-]+$", ErrorMessage = "Slug must contain only lowercase letters, numbers, and hyphens.")]
    public string Slug { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Url]
    public string? LogoUrl { get; set; }

    [Url]
    public string? Website { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? State { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(20)]
    public string? PostalCode { get; set; }

    public string? BusinessHours { get; set; }
    
    // Default Schedule Constraints
    public TimeSpan DefaultScheduleStartTime { get; set; } = new TimeSpan(9, 0, 0);
    public TimeSpan DefaultScheduleEndTime { get; set; } = new TimeSpan(18, 0, 0);
    
    [RegularExpression(@"^[0-6](,[0-6])*$", ErrorMessage = "AllowedScheduleDays must be comma-separated numbers 0-6 (0=Sunday, 6=Saturday).")]
    public string AllowedScheduleDays { get; set; } = "1,2,3,4,5,6";
}