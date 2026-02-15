using Booking.Domain.Enums;

namespace Booking.Application.Common.Constants;

/// <summary>
/// Plan limits according to subscription tiers
/// </summary>
public static class PlanLimits
{
    public static class Workers
    {
        public const int Free = 1;
        public const int Basic = 3;
        public const int Professional = 20;
        public const int Enterprise = int.MaxValue; // Unlimited
    }

    public static class Services
    {
        public const int Free = 5;
        public const int Basic = 20;
        public const int Professional = 100;
        public const int Enterprise = int.MaxValue; // Unlimited
    }

    public static class ReservationsPerMonth
    {
        public const int Free = 50;
        public const int Basic = 500;
        public const int Professional = 5000;
        public const int Enterprise = int.MaxValue; // Unlimited
    }

    /// <summary>
    /// Get the maximum number of workers allowed for a plan type
    /// </summary>
    public static int GetMaxWorkers(PlanType planType)
    {
        return planType switch
        {
            PlanType.Free => Workers.Free,
            PlanType.Basic => Workers.Basic,
            PlanType.Professional => Workers.Professional,
            PlanType.Enterprise => Workers.Enterprise,
            _ => Workers.Free
        };
    }

    /// <summary>
    /// Get the maximum number of services allowed for a plan type
    /// </summary>
    public static int GetMaxServices(PlanType planType)
    {
        return planType switch
        {
            PlanType.Free => Services.Free,
            PlanType.Basic => Services.Basic,
            PlanType.Professional => Services.Professional,
            PlanType.Enterprise => Services.Enterprise,
            _ => Services.Free
        };
    }

    /// <summary>
    /// Get the maximum number of reservations per month for a plan type
    /// </summary>
    public static int GetMaxReservationsPerMonth(PlanType planType)
    {
        return planType switch
        {
            PlanType.Free => ReservationsPerMonth.Free,
            PlanType.Basic => ReservationsPerMonth.Basic,
            PlanType.Professional => ReservationsPerMonth.Professional,
            PlanType.Enterprise => ReservationsPerMonth.Enterprise,
            _ => ReservationsPerMonth.Free
        };
    }

    /// <summary>
    /// Check if adding workers would exceed the plan limit
    /// </summary>
    public static bool CanAddWorkers(PlanType planType, int currentWorkers, int workersToAdd = 1)
    {
        var maxWorkers = GetMaxWorkers(planType);
        return currentWorkers + workersToAdd <= maxWorkers;
    }

    /// <summary>
    /// Check if adding services would exceed the plan limit
    /// </summary>
    public static bool CanAddServices(PlanType planType, int currentServices, int servicesToAdd = 1)
    {
        var maxServices = GetMaxServices(planType);
        return currentServices + servicesToAdd <= maxServices;
    }

    /// <summary>
    /// Check if adding reservations would exceed the plan limit
    /// </summary>
    public static bool CanAddReservations(PlanType planType, int currentReservations, int reservationsToAdd = 1)
    {
        var maxReservations = GetMaxReservationsPerMonth(planType);
        return currentReservations + reservationsToAdd <= maxReservations;
    }
}
