using Microsoft.AspNetCore.Authorization;

namespace Booking.Infrastructure.Authorization.Requirements;

public class TenantRequirement : IAuthorizationRequirement
{
    public TenantRequirement(bool allowSuperAdmin = true)
    {
        AllowSuperAdmin = allowSuperAdmin;
    }

    public bool AllowSuperAdmin { get; }
}
