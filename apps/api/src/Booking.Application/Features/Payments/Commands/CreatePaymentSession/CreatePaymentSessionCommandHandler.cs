using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Commands.CreatePaymentSession;

public class CreatePaymentSessionCommandHandler : IRequestHandler<CreatePaymentSessionCommand, PaymentInstructionsDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreatePaymentSessionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentInstructionsDto> Handle(CreatePaymentSessionCommand request, CancellationToken cancellationToken)
    {
        // Validate tenant exists
        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(request.TenantId);
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found");

        // Validate plan exists
        var planRepo = _unitOfWork.ReadRepository<Plan>();
        var plan = await planRepo.GetByIdAsync(request.PlanId);
        if (plan == null)
            throw new InvalidOperationException("Plan not found");

        // Check there's no active pending session for this tenant
        var sessionRepo = _unitOfWork.ReadRepository<PaymentSession>();
        var existingSession = await sessionRepo.GetAll()
            .Where(ps => ps.TenantId == request.TenantId
                && (ps.Status == PaymentSessionStatus.WaitingPayment || ps.Status == PaymentSessionStatus.WaitingReview)
                && ps.ExpiresAt > DateTime.UtcNow)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingSession != null)
            throw new InvalidOperationException("There is already an active payment session for this tenant. Please complete or wait for the current one to expire.");

        var paymentMethod = Enum.TryParse<PaymentMethod>(request.PaymentMethod, ignoreCase: true, out var method)
            ? method
            : throw new InvalidOperationException($"Invalid payment method '{request.PaymentMethod}'. Accepted values: Transfermovil, Zelle");

        // Determine amount and currency based on payment method
        var currency = paymentMethod == PaymentMethod.Transfermovil
            ? PaymentCurrency.CUP
            : PaymentCurrency.USD;

        var expectedAmount = paymentMethod == PaymentMethod.Transfermovil
            ? plan.Price * 400 // CUP conversion factor (adjust as needed)
            : plan.Price;

        // Generate reference code for Zelle
        string? referenceCode = null;
        if (paymentMethod == PaymentMethod.Zelle)
        {
            referenceCode = await GenerateUniqueReferenceCode(plan.PlanType, cancellationToken);
        }

        var paymentSession = new PaymentSession
        {
            TenantId = request.TenantId,
            PlanId = request.PlanId,
            ExpectedAmount = expectedAmount,
            Currency = currency,
            PaymentMethod = paymentMethod,
            Status = PaymentSessionStatus.WaitingPayment,
            ReferenceCode = referenceCode,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        var writeRepo = _unitOfWork.WriteRepository<PaymentSession>();
        await writeRepo.AddAsync(paymentSession);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Build instructions
        var instructions = BuildInstructions(paymentMethod, expectedAmount, currency, referenceCode);

        return new PaymentInstructionsDto
        {
            PaymentSessionId = paymentSession.Id,
            Amount = expectedAmount,
            Currency = currency.ToString(),
            PaymentMethod = paymentMethod.ToString(),
            ReferenceCode = referenceCode,
            ExpiresAt = paymentSession.ExpiresAt,
            Instructions = instructions
        };
    }

    private async Task<string> GenerateUniqueReferenceCode(PlanType planType, CancellationToken cancellationToken)
    {
        var prefix = planType switch
        {
            PlanType.Basic => "BAS",
            PlanType.Professional => "PRO",
            PlanType.Enterprise => "ENT",
            _ => "PAY"
        };

        var sessionRepo = _unitOfWork.ReadRepository<PaymentSession>();
        string referenceCode;
        bool exists;

        do
        {
            var random = Random.Shared.Next(10000, 99999);
            referenceCode = $"{prefix}-{random}";
            exists = await sessionRepo.GetAll()
                .AnyAsync(ps => ps.ReferenceCode == referenceCode, cancellationToken);
        } while (exists);

        return referenceCode;
    }

    private static string BuildInstructions(PaymentMethod method, decimal amount, PaymentCurrency currency, string? referenceCode)
    {
        if (method == PaymentMethod.Transfermovil)
        {
            return $"Send {amount:N2} {currency} via Transfermóvil. Then upload proof of payment including: screenshot, sender full name, transaction number, and date.";
        }
        else
        {
            return $"Send ${amount:N2} {currency} via Zelle. Memo: {referenceCode}. Then upload proof of payment including: screenshot, sender name, and confirmation number (if available).";
        }
    }
}
