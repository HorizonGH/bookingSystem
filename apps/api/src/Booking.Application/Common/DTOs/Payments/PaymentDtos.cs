using Booking.Domain.Enums;

namespace Booking.Application.Common.DTOs.Payments;

public record PaymentSessionDto
{
    public Guid Id { get; init; }
    public Guid TenantId { get; init; }
    public Guid PlanId { get; init; }
    public string PlanName { get; init; } = string.Empty;
    public decimal ExpectedAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string? ReferenceCode { get; init; }
    public DateTime ExpiresAt { get; init; }
    public DateTime Created { get; init; }
}

public record PaymentDto
{
    public Guid Id { get; init; }
    public Guid PaymentSessionId { get; init; }
    public Guid TenantId { get; init; }
    public string TenantName { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public string ScreenshotUrl { get; init; } = string.Empty;
    public string? TransactionNumber { get; init; }
    public string? ConfirmationNumber { get; init; }
    public DateTime TransferTime { get; init; }
    public string? AdminNotes { get; init; }
    public DateTime? ReviewedAt { get; init; }
    public DateTime Created { get; init; }
    public string? ReferenceCode { get; init; }
}

public record PaymentInstructionsDto
{
    public Guid PaymentSessionId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string? ReferenceCode { get; init; }
    public DateTime ExpiresAt { get; init; }
    public string Instructions { get; init; } = string.Empty;
}
