using Booking.Application.Common.DTOs.Auth;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse>;
