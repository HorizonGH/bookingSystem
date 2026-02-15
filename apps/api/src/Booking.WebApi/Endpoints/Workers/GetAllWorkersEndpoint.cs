using Booking.Application.Common.Pagination;
using Booking.Application.Features.Workers.Queries.GetAll;
using Booking.WebApi.Binders;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Workers;

public class GetAllWorkersEndpoint : CoreEndpoint<PaginationRequest>
{
    public GetAllWorkersEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/workers");
        AllowAnonymous();
        RequestBinder(new PaginationRequestBinder());
        Description(d => d
            .WithTags("Workers")
            .WithSummary("Get all workers with pagination")
            .WithDescription(@"Retrieves a paginated list of workers with optional filtering, searching, and sorting.
                
                Query Parameters:
                - pageNumber: Page number (default: 1)
                - pageSize: Number of items per page (default: 10)
                - searchTerm: Search across job title, bio, first name, last name, and email
                - sortBy: Property name to sort by (e.g., 'Created', 'JobTitle')
                - sortDescending: Sort in descending order (default: false)
                - filters: Generic key-value pairs for filtering (e.g., filters.tenantId=guid, filters.isAvailableForBooking=true)")
            .Produces(200));
    }

    public override async Task HandleAsync(PaginationRequest req, CancellationToken ct)
    {
        var query = new GetAllWorkersQuery { Pagination = req };
        Response = await _mediator.Send(query, ct);
    }
}
