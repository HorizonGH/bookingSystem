using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Features.Payments.Commands.UploadPaymentProof;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Payments;

/// <summary>
/// IFormFile cannot live in a MediatR command (Application layer has no HTTP dependency),
/// so a thin request class is intentionally kept here and mapped down to the command.
/// </summary>
public class UploadPaymentProofEndpoint : CoreEndpoint<UploadPaymentProofRequest, PaymentDto>
{
    public UploadPaymentProofEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/tenants/{tenantId}/payments/sessions/{sessionId}/proof");
        AllowFileUploads();

        Description(d => d
            .WithTags("Payments")
            .WithSummary("Upload payment proof")
            .WithDescription("Uploads proof of payment (screenshot + details) for a payment session. Transfermóvil requires TransactionNumber; Zelle may optionally include ConfirmationNumber.")
            .Produces<PaymentDto>(201)
            .ProducesProblem(400));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(UploadPaymentProofRequest req, CancellationToken ct)
    {
        if (req.Screenshot == null)
        {
            ThrowError("Screenshot file is required", 400);
            return;
        }

        using var stream = req.Screenshot.OpenReadStream();

        var command = new UploadPaymentProofCommand
        {
            PaymentSessionId = req.SessionId,
            TenantId = req.TenantId,
            ScreenshotStream = stream,
            ScreenshotFileName = req.Screenshot.FileName,
            SenderName = req.SenderName,
            TransferTime = req.TransferTime,
            TransactionNumber = req.TransactionNumber,
            ConfirmationNumber = req.ConfirmationNumber
        };

        try
        {
            Response = await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 201;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}

public class UploadPaymentProofRequest
{
    [BindFrom("tenantId")]
    public Guid TenantId { get; set; }

    [BindFrom("sessionId")]
    public Guid SessionId { get; set; }

    public IFormFile? Screenshot { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public DateTime TransferTime { get; set; }

    /// <summary>Required for Transfermóvil payments.</summary>
    public string? TransactionNumber { get; set; }

    /// <summary>Optional for Zelle payments.</summary>
    public string? ConfirmationNumber { get; set; }
}
