using System.Text;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Models;
using Booking.Infrastructure.Persistence;
using Booking.Infrastructure.Repositories;
using Booking.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Booking.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Add DbContext with PostgreSQL
        services.AddDbContext<BookingDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(BookingDbContext).Assembly.FullName);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorCodesToAdd: null);
            });
            
            // Enable sensitive data logging in development
            if (configuration.GetValue<bool>("Logging:EnableSensitiveDataLogging"))
            {
                options.EnableSensitiveDataLogging();
            }
        });

        // Configure JWT Settings
        var jwtSettings = new JwtSettings();
        configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        // Configure Cloudinary settings
        services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));

        // Register services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IWorkerAvailabilityService, WorkerAvailabilityService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        // Register repositories and Unit of Work
        services.AddScoped(typeof(IReadRepository<>), typeof(Repositories.ReadRepository<>));
        services.AddScoped(typeof(IWriteRepository<>), typeof(Repositories.WriteRepository<>));
        services.AddScoped<IUnitOfWork, Repositories.UnitOfWork>();

        // Configure JWT Authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.SaveToken = true;
            options.RequireHttpsMetadata = false; // Set to true in production
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        // Configure Authorization
        services.AddAuthorization(options =>
        {
            // SuperAdmin only
            options.AddPolicy(Authorization.PolicyNames.SuperAdminOnly, policy =>
                policy.RequireRole("SuperAdmin"));

            // TenantAdmin only
            options.AddPolicy(Authorization.PolicyNames.TenantAdminOnly, policy =>
                policy.RequireRole("TenantAdmin"));

            // TenantAdmin or SuperAdmin
            options.AddPolicy(Authorization.PolicyNames.TenantAdminOrSuperAdmin, policy =>
                policy.RequireRole("TenantAdmin", "SuperAdmin"));

            // Worker access
            options.AddPolicy(Authorization.PolicyNames.WorkerAccess, policy =>
                policy.RequireRole("Worker", "TenantAdmin", "SuperAdmin"));

            // Tenant isolation - validates user belongs to the tenant being accessed
            options.AddPolicy(Authorization.PolicyNames.TenantAccess, policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.AddRequirements(new Authorization.Requirements.TenantRequirement(allowSuperAdmin: true));
            });
        });

        // Register authorization handlers
        services.AddScoped<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, 
            Authorization.Handlers.TenantAuthorizationHandler>();
        
        return services;
    }
}
