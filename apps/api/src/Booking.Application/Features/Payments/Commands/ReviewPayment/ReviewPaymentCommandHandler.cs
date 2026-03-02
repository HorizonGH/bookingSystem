using Booking.Application.Common.DTOs.Payments;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using Booking.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Payments.Commands.ReviewPayment;

public class ReviewPaymentCommandHandler : IRequestHandler<ReviewPaymentCommand, PaymentDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public ReviewPaymentCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PaymentDto> Handle(ReviewPaymentCommand request, CancellationToken cancellationToken)
    {
        // Get payment with related data
        var paymentRepo = _unitOfWork.ReadRepository<Payment>();
        var payment = await paymentRepo.GetAll(includes: [p => p.PaymentSession, p => p.Tenant])
            .Where(p => p.Id == request.PaymentId)
            .FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            throw new InvalidOperationException("Payment not found");

        if (payment.Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Payment has already been reviewed");

        var paymentWriteRepo = _unitOfWork.WriteRepository<Payment>();
        var sessionWriteRepo = _unitOfWork.WriteRepository<PaymentSession>();

        payment.ReviewedAt = DateTime.UtcNow;
        payment.ReviewedByUserId = request.ReviewedByUserId;
        payment.AdminNotes = request.AdminNotes;

        if (request.Approve)
        {
            payment.Status = PaymentStatus.Approved;
            payment.PaymentSession.Status = PaymentSessionStatus.Completed;

            // Activate subscription
            await ActivateSubscription(payment.TenantId, payment.PaymentSession.PlanId, cancellationToken);
        }
        else
        {
            payment.Status = PaymentStatus.Rejected;
            payment.PaymentSession.Status = PaymentSessionStatus.Rejected;
        }

        paymentWriteRepo.Update(payment);
        sessionWriteRepo.Update(payment.PaymentSession);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return PaymentMapper.ToDto(payment);
    }

    private async Task ActivateSubscription(Guid tenantId, Guid planId, CancellationToken cancellationToken)
    {
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();

        // retire any currently active subscriptions for this tenant
        var activePlans = await tenantPlanRepo.GetAll()
            .Where(tp => tp.TenantId == tenantId && tp.SubscriptionStatus == SubscriptionStatus.Active)
            .ToListAsync(cancellationToken);

        foreach (var ap in activePlans)
        {
            ap.SubscriptionStatus = SubscriptionStatus.Suspended;
            ap.EndDate = DateTime.UtcNow;
            tenantPlanWriteRepo.Update(ap);
        }

        // create a fresh tenant plan record for the new purchase
        var newTenantPlan = new TenantPlan
        {
            TenantId = tenantId,
            PlanId = planId,
            SubscriptionStatus = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            NextBillingDate = DateTime.UtcNow.AddDays(30),
            CurrentPrice = 0 // Will be set from plan
        };

        // Get plan price
        var planRepo = _unitOfWork.ReadRepository<Plan>();
        var plan = await planRepo.GetByIdAsync(planId);
        if (plan != null)
        {
            newTenantPlan.CurrentPrice = plan.Price;
        }

        await tenantPlanWriteRepo.AddAsync(newTenantPlan);
    }
}
