using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Tenancy.Queries;
using Booking.Application.Features.Tenancy.Queries.GetById;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class GetTenantByIdEndpoint : CoreEndpointWithoutRequest<TenantDto?>
{
    public GetTenantByIdEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{id}");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .Produces<TenantDto>(200)
            .Produces(404));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var query = new GetTenantByIdQuery { Id = id };
        var result = await _mediator.Send(query, ct);

        if (result == null)
        {
            HttpContext.Response.StatusCode = 404;
            return;
        }

        Response = result;
    }
}