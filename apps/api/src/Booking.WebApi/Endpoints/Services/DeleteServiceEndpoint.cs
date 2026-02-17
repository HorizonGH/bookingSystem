using Booking.Application.Features.Services.Commands.Delete;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Services;

public class DeleteServiceEndpoint : CoreEndpoint<DeleteServiceCommand, bool>
{
    public DeleteServiceEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Delete("/services");
        Description(d => d
            .WithTags("Services")
            .WithSummary("Delete a service")
            .WithDescription("Deletes a service. ServiceId must be provided in the request body. Will fail if there are existing reservations for the service.")
            .Produces(200)
            .ProducesProblem(400));
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(DeleteServiceCommand req, CancellationToken ct)
    {
        try
        {
            Response = await _mediator.Send(req, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}