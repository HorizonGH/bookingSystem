namespace Booking.Domain.Enums;

public enum SubscriptionStatus
{
    Trial,
    Active,
    Suspended,
    Cancelled,
    Expired,
    /// <summary>Paid plan selected at registration but not yet approved by SuperAdmin.</summary>
    Pending
}
