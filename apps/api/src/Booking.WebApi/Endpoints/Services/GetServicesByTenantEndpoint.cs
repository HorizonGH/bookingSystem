using Booking.Application.Features.Services.Queries.GetByTenant;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Services;

public class GetServicesByTenantEndpoint : CoreEndpoint<GetServicesByTenantQuery, ServicesByTenantResponse>
{
    public GetServicesByTenantEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/services/by-tenant");
        AllowAnonymous();
        Description(d => d
            .WithTags("Services")
            .WithSummary("Get services for a tenant")
            .WithDescription("Retrieves services for a tenant along with plan information. Provide { TenantId } in the request body.")
            .Produces(200));
    }

    public override async Task HandleAsync(GetServicesByTenantQuery query, CancellationToken ct)
    {
        Response = await _mediator.Send(query, ct);
    }
}