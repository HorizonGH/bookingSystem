using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using Booking.Infrastructure.Authorization.Requirements;
using Booking.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Authorization.Handlers;

public class AnalyticsAuthorizationHandler : AuthorizationHandler<AnalyticsRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public AnalyticsAuthorizationHandler(
        IHttpContextAccessor httpContextAccessor,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _httpContextAccessor = httpContextAccessor;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AnalyticsRequirement requirement)
    {
        if (requirement.AllowSuperAdmin && _currentUserService.IsSuperAdmin)
        {
            context.Succeed(requirement);
            return;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            context.Fail();
            return;
        }

        var routeTenantId = httpContext.Request.RouteValues["tenantId"]?.ToString();
        var userTenantId = httpContext.User.GetTenantId();

        if (!Guid.TryParse(routeTenantId, out var tenantId))
        {
            if (!userTenantId.HasValue)
            {
                context.Fail();
                return;
            }

            tenantId = userTenantId.Value;
        }

        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(tp => tp.TenantId == tenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync();

        if (tenantPlan?.Plan != null)
        {
            var hasAnalytics = tenantPlan.Plan.HasAnalytics;
            var isProOrEnterprise = tenantPlan.Plan.PlanType == Booking.Domain.Enums.PlanType.Professional
                || tenantPlan.Plan.PlanType == Booking.Domain.Enums.PlanType.Enterprise;

            if (hasAnalytics && isProOrEnterprise)
            {
                context.Succeed(requirement);
                return;
            }
        }

        context.Fail();
    }
}
