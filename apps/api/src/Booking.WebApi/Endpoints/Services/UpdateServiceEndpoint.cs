using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Services.Commands.Update;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Services;

public class UpdateServiceEndpoint : CoreEndpoint<UpdateServiceRequest, ServiceDto>
{
    public UpdateServiceEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Put("/services");
        Description(d => d
            .WithTags("Services")
            .WithSummary("Update a service")
            .WithDescription("Updates an existing service for the tenant. ID must be provided in the request body.")
            .Produces(200)
            .ProducesProblem(400));
        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(UpdateServiceRequest req, CancellationToken ct)
    {
        try
        {
            var command = new UpdateServiceCommand { ServiceId = req.Id, Request = req };
            Response = await _mediator.Send(command, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}