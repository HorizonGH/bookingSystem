using Booking.Application.Common.DTOs.Auth;
using Booking.Domain.Enums;
using MediatR;

namespace Booking.Application.Features.Auth.Commands.RegisterSaasTenant;

public record RegisterSaasTenantCommand(
    RegisterRequest UserRequest,
    CreateSaasTenantRequest TenantRequest
) : IRequest<AuthResponse>;