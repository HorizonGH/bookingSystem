using System.Security.Claims;

namespace Booking.Infrastructure.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    public static Guid? GetTenantId(this ClaimsPrincipal principal)
    {
        var tenantIdClaim = principal.FindFirst("TenantId")?.Value;
        return Guid.TryParse(tenantIdClaim, out var tenantId) ? tenantId : null;
    }

    public static string? GetEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Email)?.Value;
    }

    public static IEnumerable<string> GetRoles(this ClaimsPrincipal principal)
    {
        return principal.FindAll(ClaimTypes.Role).Select(c => c.Value);
    }

    public static bool IsSuperAdmin(this ClaimsPrincipal principal)
    {
        return principal.IsInRole("SuperAdmin");
    }

    public static bool IsTenantAdmin(this ClaimsPrincipal principal)
    {
        return principal.IsInRole("TenantAdmin");
    }

    public static bool IsWorker(this ClaimsPrincipal principal)
    {
        return principal.IsInRole("Worker");
    }

    public static bool IsClient(this ClaimsPrincipal principal)
    {
        return principal.IsInRole("Client");
    }
}
