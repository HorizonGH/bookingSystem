using Booking.Application.Common.Pagination;
using Booking.Application.Features.Services.Queries.GetAll;
using Booking.WebApi.Binders;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Services;

public class GetAllServicesEndpoint : CoreEndpoint<PaginationRequest>
{
    public GetAllServicesEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/services");
        AllowAnonymous();
        RequestBinder(new PaginationRequestBinder());
        Description(d => d
            .WithTags("Services")
            .WithSummary("Get all services with pagination")
            .WithDescription("Retrieves a paginated list of services with optional filtering, searching, and sorting.")
            .Produces(200));
    }

    public override async Task HandleAsync(PaginationRequest req, CancellationToken ct)
    {
        var query = new GetAllServicesQuery { Pagination = req };
        Response = await _mediator.Send(query, ct);
    }
}