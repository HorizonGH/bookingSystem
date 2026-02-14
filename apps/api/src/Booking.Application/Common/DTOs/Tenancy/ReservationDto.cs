using System;
using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Tenancy;

public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid WorkerId { get; set; }
    public Guid ClientId { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ReservationStatus ReservationStatus { get; set; }

    // Client Information
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;

    // Booking details
    public decimal Price { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }

    // Notifications
    public bool ReminderSent { get; set; }
    public bool ConfirmationSent { get; set; }

    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
}