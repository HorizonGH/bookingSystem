using Booking.Application.Common.Pagination;
using Booking.Application.Features.Reservations.Queries;
using Booking.Application.Features.Reservations.Queries.GetAll;
using Booking.WebApi.Binders;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class GetAllReservationsEndpoint : CoreEndpoint<PaginationRequest>
{
    public GetAllReservationsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/reservations");
        AllowAnonymous(); // Adjust authorization as needed
        RequestBinder(new PaginationRequestBinder());
        Description(d => d
            .WithTags("Reservations")
            .WithSummary("Get all reservations with pagination, search, filtering, and sorting")
            .WithDescription(@"Retrieves a paginated list of reservations with optional filtering, searching, and sorting.

                Query Parameters:
                - pageNumber: Page number (default: 1)
                - pageSize: Number of items per page (default: 10)
                - searchTerm: Search across client name, email, phone, and notes
                - sortBy: Property name to sort by (e.g., 'StartTime', 'ClientName', 'Created')
                - sortDescending: Sort in descending order (default: false)
                - filters: Generic key-value pairs for filtering (e.g., filters.status=Confirmed, filters.tenantId=guid)")
            .Produces(200));
    }

    public override async Task HandleAsync(PaginationRequest req, CancellationToken ct)
    {
        var query = new GetAllReservationsQuery { Pagination = req };
        Response = await _mediator.Send(query, ct);
    }
}