using Booking.Application.Features.Reservations.Commands.Cancel;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class CancelReservationEndpoint : CoreEndpoint<CancelReservationCommand>
{
    public CancelReservationEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Put("/tenants/{tenantId}/reservations/{reservationId}/cancel");

        Description(d => d
            .WithTags("Reservations")
            .WithSummary("Cancel a reservation")
            .WithDescription("Marks a reservation as cancelled instead of deleting it.")
            .Produces(204)
            .ProducesProblem(400)
            .ProducesProblem(404));

        Roles("TenantAdmin", "SuperAdmin");
    }

    public override async Task HandleAsync(CancelReservationCommand req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(req, ct);
            HttpContext.Response.StatusCode = 204;
        }
        catch (KeyNotFoundException ex)
        {
            ThrowError(ex.Message, 404);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}
