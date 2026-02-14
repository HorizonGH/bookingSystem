using System.ComponentModel.DataAnnotations;
using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Auth;

public class RegisterSaasTenantRequest
{
    [Required]
    public RegisterRequest UserRequest { get; set; } = null!;

    [Required]
    public CreateSaasTenantRequest TenantRequest { get; set; } = null!;
}

public class CreateSaasTenantRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Url]
    public string? LogoUrl { get; set; }

    [Url]
    public string? Website { get; set; }

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

    [Required]
    public PlanType PlanType { get; set; } = PlanType.Free; // Default to Free plan
}