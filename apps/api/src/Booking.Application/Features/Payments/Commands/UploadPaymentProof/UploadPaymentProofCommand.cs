using Booking.Application.Common.DTOs.Payments;
using Booking.Domain.Enums;
using MediatR;

namespace Booking.Application.Features.Payments.Commands.UploadPaymentProof;

public class UploadPaymentProofCommand : IRequest<PaymentDto>
{
    public Guid PaymentSessionId { get; set; }
    public Guid TenantId { get; set; }
    
    // Proof fields
    public Stream ScreenshotStream { get; set; } = Stream.Null;
    public string ScreenshotFileName { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public DateTime TransferTime { get; set; }
    
    /// <summary>
    /// Required for Transfermóvil payments.
    /// </summary>
    public string? TransactionNumber { get; set; }
    
    /// <summary>
    /// Optional for Zelle payments.
    /// </summary>
    public string? ConfirmationNumber { get; set; }
}
