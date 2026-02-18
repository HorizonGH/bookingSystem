using Booking.Application.Common.DTOs.Tenancy;
using MediatR;

namespace Booking.Application.Features.Tenancy.Queries.GetAllPlans;

public class GetAllPlansQuery : IRequest<List<PlanDto>>
{
}
