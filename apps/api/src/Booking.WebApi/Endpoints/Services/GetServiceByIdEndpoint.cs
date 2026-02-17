using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Services.Queries.GetById;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Services;

public class GetServiceByIdEndpoint : CoreEndpoint<GetServiceByIdQuery, ServiceDto>
{
    public GetServiceByIdEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/services/get-by-id");
        AllowAnonymous();
        Description(d => d
            .WithTags("Services")
            .WithSummary("Get a service by ID")
            .WithDescription("Retrieves a single service by ID. Provide { Id } in the request body.")
            .Produces(200));
    }

    public override async Task HandleAsync(GetServiceByIdQuery query, CancellationToken ct)
    {
        Response = await _mediator.Send(query, ct);
    }
}