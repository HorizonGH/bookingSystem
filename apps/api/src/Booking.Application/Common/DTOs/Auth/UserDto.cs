namespace Booking.Application.Common.DTOs.Auth;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    Guid? TenantId,
    bool IsEmailVerified,
    List<string> Roles
);
