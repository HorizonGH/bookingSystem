using Booking.Application.Common.DTOs.Payments;
using Booking.Domain.Entities.Tenancy;

namespace Booking.Application.Common.Mappers;

public static class PaymentMapper
{
    public static PaymentSessionDto ToDto(PaymentSession session)
    {
        return new PaymentSessionDto
        {
            Id = session.Id,
            TenantId = session.TenantId,
            PlanId = session.PlanId,
            PlanName = session.Plan?.Name ?? string.Empty,
            ExpectedAmount = session.ExpectedAmount,
            Currency = session.Currency.ToString(),
            PaymentMethod = session.PaymentMethod.ToString(),
            Status = session.Status.ToString(),
            ReferenceCode = session.ReferenceCode,
            ExpiresAt = session.ExpiresAt,
            Created = session.Created
        };
    }

    public static PaymentDto ToDto(Payment payment)
    {
        return new PaymentDto
        {
            Id = payment.Id,
            PaymentSessionId = payment.PaymentSessionId,
            TenantId = payment.TenantId,
            TenantName = payment.Tenant?.Name ?? string.Empty,
            Amount = payment.Amount,
            Currency = payment.Currency.ToString(),
            PaymentMethod = payment.PaymentMethod.ToString(),
            Status = payment.Status.ToString(),
            SenderName = payment.SenderName,
            ScreenshotUrl = payment.ScreenshotUrl,
            TransactionNumber = payment.TransactionNumber,
            ConfirmationNumber = payment.ConfirmationNumber,
            TransferTime = payment.TransferTime,
            AdminNotes = payment.AdminNotes,
            ReviewedAt = payment.ReviewedAt,
            Created = payment.Created,
            ReferenceCode = payment.PaymentSession?.ReferenceCode
        };
    }
}
