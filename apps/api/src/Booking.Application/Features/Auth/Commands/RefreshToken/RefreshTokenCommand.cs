using Booking.Application.Common.DTOs.Auth;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<AuthResponse>;
