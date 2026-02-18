using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Tenancy.Queries.GetAllPlans;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class GetAllPlansEndpoint : CoreEndpointWithoutRequest<List<PlanDto>>
{
    public GetAllPlansEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/plans");
        AllowAnonymous();
        Description(d => d
            .WithTags("Plans")
            .WithSummary("Get all available plans")
            .WithDescription("Returns the list of plans with features and pricing information.")
            .Produces<List<PlanDto>>(200));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetAllPlansQuery();
        Response = await _mediator.Send(query, ct);
        await Send.OkAsync(Response, ct);
    }
}