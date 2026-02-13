using Booking.Application.Features.Tenancy.Commands;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class DeleteTenantEndpoint : EndpointWithoutRequest
{
    private readonly IMediator _mediator;

    public DeleteTenantEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Delete("/tenants/{id}");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .Produces(204)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var id = Route<Guid>("id");
        var command = new DeleteTenantCommand { Id = id };
        await _mediator.Send(command, ct);

        HttpContext.Response.StatusCode = 204;
    }
}