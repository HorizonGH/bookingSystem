using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Reservations.Commands;
using Booking.Application.Features.Reservations.Commands.Update;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class UpdateReservationEndpoint : CoreEndpoint<UpdateReservationCommand, ReservationDto>
{
    public UpdateReservationEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Put("/reservations");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Reservations")
            .Produces<ReservationDto>(200)
            .ProducesProblem(400)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(UpdateReservationCommand req, CancellationToken ct)
    {
        Response = await _mediator.Send(req, ct);
    }
}