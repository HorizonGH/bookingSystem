namespace Booking.Application.Common.Constants;

public static class AuthConstants
{
    public static class Roles
    {
        public const string SuperAdmin = "SuperAdmin";
        public const string TenantAdmin = "TenantAdmin";
        public const string Worker = "Worker";
        public const string Client = "Client";
    }

    public static class Claims
    {
        public const string TenantId = "TenantId";
        public const string UserId = "UserId";
    }

    public static class Policies
    {
        public const string SuperAdminOnly = "SuperAdminOnly";
        public const string TenantAdminOnly = "TenantAdminOnly";
        public const string TenantAccess = "TenantAccess";
        public const string TenantAdminOrSuperAdmin = "TenantAdminOrSuperAdmin";
        public const string WorkerAccess = "WorkerAccess";
    }
}
