using Booking.Application.Common.Pagination;
using Booking.Application.Features.Tenancy.Queries;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class GetAllTenantsEndpoint : Endpoint<PaginationRequest>
{
    private readonly IMediator _mediator;

    public GetAllTenantsEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Get("/tenants");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .WithSummary("Get all tenants with pagination, search, filtering, and sorting")
            .WithDescription(@"Retrieves a paginated list of tenants with optional filtering, searching, and sorting.
                
                Query Parameters:
                - pageNumber: Page number (default: 1)
                - pageSize: Number of items per page (default: 10)
                - searchTerm: Search across name, slug, description, email, city, and country
                - sortBy: Property name to sort by (e.g., 'Name', 'Email', 'Created')
                - sortDescending: Sort in descending order (default: false)
                - filters: Generic key-value pairs for filtering (e.g., filters.status=active, filters.isActive=true)")
            .Produces(200));
    }

    public override async Task HandleAsync(PaginationRequest req, CancellationToken ct)
    {
        var query = new GetAllTenantsQuery
        {
            Pagination = req
        };
        Response = await _mediator.Send(query, ct);
    }
}