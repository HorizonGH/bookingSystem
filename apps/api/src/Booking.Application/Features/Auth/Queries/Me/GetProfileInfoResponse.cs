using Booking.Application.Common.DTOs.Tenancy;

namespace Booking.Application.Features.Auth.Queries.Me;

public record GetProfileInfoResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    public string Role { get; set; } = string.Empty; // primary role (legacy)
    public ICollection<string> Roles { get; set; } = new List<string>();

    public ICollection<ReservationDto> Reservations { get; set; } = new List<ReservationDto>();
    public Guid? TenantId { get; set; }

    // public int ReservationCount { get; set; }
    // public int CompletedReservationCount { get; set; }
    // public int CancelledReservationCount { get; set; }

}
