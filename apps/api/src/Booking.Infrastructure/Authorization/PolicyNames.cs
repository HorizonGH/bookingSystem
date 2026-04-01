namespace Booking.Infrastructure.Authorization;

public static class PolicyNames
{
    public const string SuperAdminOnly = "SuperAdminOnly";
    public const string TenantAdminOnly = "TenantAdminOnly";
    public const string TenantAccess = "TenantAccess";
    public const string TenantAdminOrSuperAdmin = "TenantAdminOrSuperAdmin";
    public const string WorkerAccess = "WorkerAccess";
    public const string HasAnalytics = "HasAnalytics";
}
