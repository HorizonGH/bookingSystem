using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Tenancy.Queries.GetAllPlans;

public class GetAllPlansQueryHandler : IRequestHandler<GetAllPlansQuery, List<PlanDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllPlansQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<List<PlanDto>> Handle(GetAllPlansQuery request, CancellationToken cancellationToken)
    {
        var repo = _unitOfWork.ReadRepository<Plan>();
        var plans = await repo.GetAll()
            .OrderBy(p => p.Price)
            .ToListAsync(cancellationToken);

        return plans.Select(PlanMapper.ToDto).ToList();
    }
}
