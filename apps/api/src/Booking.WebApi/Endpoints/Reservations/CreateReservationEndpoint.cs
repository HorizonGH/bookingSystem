using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Reservations.Commands;
using Booking.Application.Features.Reservations.Commands.Create;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class CreateReservationEndpoint : CoreEndpoint<CreateReservationCommand, ReservationDto>
{
    public CreateReservationEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/reservations");
        Description(d => d
            .WithTags("Reservations")
            .Produces<ReservationDto>(201)
            .ProducesProblem(400));
    }

    public override async Task HandleAsync(CreateReservationCommand req, CancellationToken ct)
    {
        Response = await _mediator.Send(req, ct);
        HttpContext.Response.StatusCode = 201;
    }
}