using Microsoft.AspNetCore.Authorization;

namespace Booking.Infrastructure.Authorization.Requirements;

public class AnalyticsRequirement : IAuthorizationRequirement
{
    public AnalyticsRequirement(bool allowSuperAdmin = true)
    {
        AllowSuperAdmin = allowSuperAdmin;
    }

    public bool AllowSuperAdmin { get; }
}
