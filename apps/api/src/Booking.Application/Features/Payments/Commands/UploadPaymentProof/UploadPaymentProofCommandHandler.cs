using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Commands.UploadPaymentProof;

public class UploadPaymentProofCommandHandler : IRequestHandler<UploadPaymentProofCommand, PaymentDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICloudinaryService _cloudinaryService;

    public UploadPaymentProofCommandHandler(IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
    {
        _unitOfWork = unitOfWork;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<PaymentDto> Handle(UploadPaymentProofCommand request, CancellationToken cancellationToken)
    {
        // Validate payment session
        var sessionRepo = _unitOfWork.ReadRepository<PaymentSession>();
        var session = await sessionRepo.GetAll(includes: [ps => ps.Plan, ps => ps.Tenant])
            .Where(ps => ps.Id == request.PaymentSessionId && ps.TenantId == request.TenantId)
            .FirstOrDefaultAsync(cancellationToken);

        if (session == null)
            throw new InvalidOperationException("Payment session not found");

        if (session.Status != PaymentSessionStatus.WaitingPayment)
            throw new InvalidOperationException("Payment session is not in waiting payment status");

        if (session.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("Payment session has expired. Please create a new one.");

        // normalize transfer time to UTC immediately so we never persist local kinds
        var transferTimeUtc = request.TransferTime.Kind == DateTimeKind.Utc
            ? request.TransferTime
            : request.TransferTime.ToUniversalTime();

        // Anti-fraud: Validate required fields per payment method
        if (session.PaymentMethod == PaymentMethod.Transfermovil)
        {
            if (string.IsNullOrWhiteSpace(request.TransactionNumber))
                throw new InvalidOperationException("Transaction number is required for Transfermóvil payments");

            // Check for duplicate transaction number
            var paymentRepo = _unitOfWork.ReadRepository<Payment>();
            var duplicateTxn = await paymentRepo.GetAll()
                .AnyAsync(p => p.TransactionNumber == request.TransactionNumber, cancellationToken);

            if (duplicateTxn)
                throw new InvalidOperationException("This transaction number has already been used");

            // Check for duplicate date + amount (anti-fraud for Transfermóvil)
            var duplicateTransfer = await paymentRepo.GetAll()
                .AnyAsync(p => p.PaymentMethod == PaymentMethod.Transfermovil
                    && p.TransferTime.Date == transferTimeUtc.Date
                    && p.Amount == session.ExpectedAmount
                    && p.Status != PaymentStatus.Rejected, cancellationToken);

            if (duplicateTransfer)
                throw new InvalidOperationException("A payment with the same amount and date already exists");
        }
        else if (session.PaymentMethod == PaymentMethod.Zelle)
        {
            if (!string.IsNullOrWhiteSpace(request.ConfirmationNumber))
            {
                var paymentRepo = _unitOfWork.ReadRepository<Payment>();
                var duplicateConfirmation = await paymentRepo.GetAll()
                    .AnyAsync(p => p.ConfirmationNumber == request.ConfirmationNumber
                        && p.Status != PaymentStatus.Rejected, cancellationToken);

                if (duplicateConfirmation)
                    throw new InvalidOperationException("This confirmation number has already been used");
            }
        }

        // Upload screenshot
        var folder = $"payments/{request.TenantId}";
        var (publicId, url) = await _cloudinaryService.UploadImageAsync(
            request.ScreenshotStream,
            request.ScreenshotFileName,
            folder,
            cancellationToken);

        // Create payment record
        var payment = new Payment
        {
            PaymentSessionId = request.PaymentSessionId,
            TenantId = request.TenantId,
            Amount = session.ExpectedAmount,
            Currency = session.Currency,
            PaymentMethod = session.PaymentMethod,
            Status = PaymentStatus.Pending,
            SenderName = request.SenderName,
            ScreenshotUrl = url,
            ScreenshotPublicId = publicId,
            TransactionNumber = request.TransactionNumber,
            ConfirmationNumber = request.ConfirmationNumber,
            TransferTime = transferTimeUtc
        };

        var paymentWriteRepo = _unitOfWork.WriteRepository<Payment>();
        await paymentWriteRepo.AddAsync(payment);

        // Update session status
        session.Status = PaymentSessionStatus.WaitingReview;
        var sessionWriteRepo = _unitOfWork.WriteRepository<PaymentSession>();
        sessionWriteRepo.Update(session);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Re-fetch with related data for DTO
        payment.PaymentSession = session;
        payment.Tenant = session.Tenant;

        return PaymentMapper.ToDto(payment);
    }
}
