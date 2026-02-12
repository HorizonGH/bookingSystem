using MediatR;

namespace Booking.Application.Features.Auth.Commands.Logout;

public record LogoutCommand(Guid UserId) : IRequest;
