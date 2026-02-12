using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Models;
using Booking.Domain.Entities.Idendity;
using Booking.Domain.Enums;
using Booking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Booking.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly BookingDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        BookingDbContext context,
        IJwtService jwtService,
        ITokenService tokenService,
        IPasswordHasher passwordHasher,
        IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        _jwtService = jwtService;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        // Find user with roles
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
            return Result<AuthResponse>.Failure("Invalid email or password");

        // Verify password
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Result<AuthResponse>.Failure("Invalid email or password");

        // Check if user is active
        if (user.StatusBaseEntity != StatusBaseEntity.Active)
            return Result<AuthResponse>.Failure("Account is inactive");

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Generate tokens
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Save refresh token
        await _tokenService.CreateRefreshTokenAsync(user.Id, refreshToken, cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.TenantId,
            user.IsEmailVerified,
            roles
        );

        var response = new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            userDto
        );

        return Result<AuthResponse>.Success(response);
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser != null)
            return Result<AuthResponse>.Failure("Email already registered");

        // Get Client role
        var clientRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleType == RoleType.Client, cancellationToken);

        if (clientRole == null)
            return Result<AuthResponse>.Failure("Client role not found in the system");

        // Create user
        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            TenantId = null, // Clients are not tied to a specific tenant
            IsEmailVerified = false,
            StatusBaseEntity = StatusBaseEntity.Active
        };

        _context.Users.Add(user);

        // Assign Client role
        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = clientRole.Id
        };

        _context.UserRoles.Add(userRole);

        await _context.SaveChangesAsync(cancellationToken);

        // Generate tokens
        var roles = new List<string> { clientRole.Name };
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Save refresh token
        await _tokenService.CreateRefreshTokenAsync(user.Id, refreshToken, cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.TenantId,
            user.IsEmailVerified,
            roles
        );

        var response = new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            userDto
        );

        return Result<AuthResponse>.Success(response);
    }

    public async Task<Result<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        // Validate access token structure (without lifetime validation)
        var principal = _jwtService.ValidateToken(request.AccessToken, validateLifetime: false);
        if (principal == null)
            return Result<AuthResponse>.Failure("Invalid access token");

        // Get user ID from token
        var userId = _jwtService.GetUserIdFromToken(request.AccessToken);
        if (userId == null)
            return Result<AuthResponse>.Failure("Invalid access token");

        // Validate refresh token
        var isValid = await _tokenService.ValidateRefreshTokenAsync(request.RefreshToken, cancellationToken);
        if (!isValid)
            return Result<AuthResponse>.Failure("Invalid or expired refresh token");

        // Get refresh token with user info
        var storedRefreshToken = await _tokenService.GetRefreshTokenAsync(request.RefreshToken, cancellationToken);
        if (storedRefreshToken == null || storedRefreshToken.UserId != userId)
            return Result<AuthResponse>.Failure("Invalid refresh token");

        var user = storedRefreshToken.User;

        // Check if user is active
        if (user.StatusBaseEntity != StatusBaseEntity.Active)
            return Result<AuthResponse>.Failure("Account is inactive");

        // Generate new tokens
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var newAccessToken = _jwtService.GenerateAccessToken(user, roles);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        // Revoke old refresh token and save new one
        await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, newRefreshToken, cancellationToken);
        await _tokenService.CreateRefreshTokenAsync(user.Id, newRefreshToken, cancellationToken);

        var userDto = new UserDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.TenantId,
            user.IsEmailVerified,
            roles
        );

        var response = new AuthResponse(
            newAccessToken,
            newRefreshToken,
            DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            userDto
        );

        return Result<AuthResponse>.Success(response);
    }

    public async Task<Result> RevokeTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var isValid = await _tokenService.ValidateRefreshTokenAsync(token, cancellationToken);
        if (!isValid)
            return Result.Failure("Invalid refresh token");

        await _tokenService.RevokeRefreshTokenAsync(token, cancellationToken: cancellationToken);

        return Result.Success();
    }

    public async Task<Result> LogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        await _tokenService.RevokeAllUserTokensAsync(userId, cancellationToken);
        return Result.Success();
    }
}
