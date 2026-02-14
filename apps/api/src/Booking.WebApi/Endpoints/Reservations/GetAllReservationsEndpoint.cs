using Booking.Application.Common.Pagination;
using Booking.Application.Features.Reservations.Queries;
using Booking.Application.Features.Reservations.Queries.GetAll;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class GetAllReservationsEndpoint : CoreEndpoint<GetAllReservationsQuery>
{
    public GetAllReservationsEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/reservations");
        AllowAnonymous(); // Adjust authorization as needed
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
                - filters: Generic key-value pairs for filtering (e.g., filters.status=confirmed, filters.tenantId=123)")
            .Produces(200));
    }

    public override async Task HandleAsync(GetAllReservationsQuery req, CancellationToken ct)
    {
        Response = await _mediator.Send(req, ct);
    }
}