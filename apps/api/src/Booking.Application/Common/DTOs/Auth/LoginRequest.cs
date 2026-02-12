namespace Booking.Application.Common.DTOs.Auth;

public record LoginRequest(
    string Email,
    string Password
);
