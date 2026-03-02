namespace Booking.Domain.Enums;

public enum PaymentSessionStatus
{
    WaitingPayment,
    WaitingReview,
    Completed,
    Rejected,
    Expired
}
