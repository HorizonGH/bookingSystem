using System;
using System.ComponentModel.DataAnnotations;
using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Tenancy;

public class UpdateReservationRequest
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    public Guid TenantId { get; set; }

    [Required]
    public Guid ServiceId { get; set; }

    [Required]
    public Guid WorkerId { get; set; }

    [Required]
    public Guid ClientId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    public ReservationStatus ReservationStatus { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    // Client Information
    [Required]
    [StringLength(200)]
    public string ClientName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string ClientEmail { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string ClientPhone { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(500)]
    public string? CancellationReason { get; set; }

    public DateTime? CancelledAt { get; set; }

    public bool ReminderSent { get; set; }
    public bool ConfirmationSent { get; set; }
}