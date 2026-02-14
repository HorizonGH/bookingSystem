using Booking.Application.Features.Reservations.Commands;
using Booking.Application.Features.Reservations.Commands.Delete;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class DeleteReservationEndpoint : CoreEndpoint<DeleteReservationCommand>
{
    public DeleteReservationEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Delete("/reservations/{id}");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Reservations")
            .Produces(204)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(DeleteReservationCommand req, CancellationToken ct)
    {
        await _mediator.Send(req, ct);
        await Send.OkAsync(ct); 
    }
}