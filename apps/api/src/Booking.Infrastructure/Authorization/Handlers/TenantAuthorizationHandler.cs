using Booking.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace Booking.Infrastructure.Authorization.Handlers;

public class TenantAuthorizationHandler : AuthorizationHandler<Requirements.TenantRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICurrentUserService _currentUserService;

    public TenantAuthorizationHandler(
        IHttpContextAccessor httpContextAccessor,
        ICurrentUserService currentUserService)
    {
        _httpContextAccessor = httpContextAccessor;
        _currentUserService = currentUserService;
    }

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        Requirements.TenantRequirement requirement)
    {
        // SuperAdmin can access all tenants
        if (requirement.AllowSuperAdmin && _currentUserService.IsSuperAdmin)
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Get tenant ID from route
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        // Try to get tenantId from route values
        var routeTenantId = httpContext.Request.RouteValues["tenantId"]?.ToString();
        
        // If no tenant in route, check if user has a tenant (TenantAdmin, Worker)
        if (string.IsNullOrEmpty(routeTenantId))
        {
            // User must have a tenant ID in their claims
            if (_currentUserService.TenantId.HasValue)
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }

            context.Fail();
            return Task.CompletedTask;
        }

        // Validate tenant ID from route matches user's tenant
        if (Guid.TryParse(routeTenantId, out var tenantId))
        {
            if (_currentUserService.TenantId == tenantId)
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        context.Fail();
        return Task.CompletedTask;
    }
}
