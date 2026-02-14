using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Reservations.Queries;
using Booking.Application.Features.Reservations.Queries.GetById;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Reservations;

public class GetReservationByIdEndpoint : CoreEndpoint<GetReservationByIdQuery, ReservationDto>
{
    public GetReservationByIdEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/reservations/{id}");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Reservations")
            .Produces<ReservationDto>(200)
            .Produces(404));
    }

    public override async Task HandleAsync(GetReservationByIdQuery req, CancellationToken ct)
    {
        var result = await _mediator.Send(req, ct);
        await Send.OkAsync(result!, ct);
    }
}