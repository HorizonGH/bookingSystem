using Booking.Application.Common.DTOs.Auth;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string PhoneNumber
) : IRequest<AuthResponse>;
