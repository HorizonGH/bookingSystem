namespace Booking.Application.Common.DTOs.Auth;

public record RefreshTokenRequest(
    string AccessToken,
    string RefreshToken
);
