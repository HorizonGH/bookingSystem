using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Services.Commands.Create;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Services;

public class CreateServiceEndpoint : CoreEndpoint<CreateServiceCommand, ServiceDto>
{
    public CreateServiceEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/services");

        Description(d => d
            .WithTags("Services")
            .WithSummary("Create a new service")
            .WithDescription("Creates a new service for the tenant. Validates plan limits before creation.")
            .Produces(201)
            .ProducesProblem(400));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(CreateServiceCommand req, CancellationToken ct)
    {
        try
        {
            Response = await _mediator.Send(req, ct);
            HttpContext.Response.StatusCode = 201;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}