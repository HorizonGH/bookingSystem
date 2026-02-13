using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Tenancy.Commands;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class UpdateTenantEndpoint : Endpoint<UpdateTenantRequest, TenantDto>
{
    private readonly IMediator _mediator;

    public UpdateTenantEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Put("/tenants");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .Produces<TenantDto>(200)
            .ProducesProblem(400)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(UpdateTenantRequest req, CancellationToken ct)
    {
        var command = new UpdateTenantCommand { Request = req };
        Response = await _mediator.Send(command, ct);
    }
}