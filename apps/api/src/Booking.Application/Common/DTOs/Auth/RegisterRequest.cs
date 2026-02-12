namespace Booking.Application.Common.DTOs.Auth;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber
);
