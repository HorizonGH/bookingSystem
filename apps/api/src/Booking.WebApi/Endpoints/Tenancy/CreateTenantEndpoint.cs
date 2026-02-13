using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Tenancy.Commands;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class CreateTenantEndpoint : Endpoint<CreateTenantRequest, TenantDto>
{
    private readonly IMediator _mediator;

    public CreateTenantEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override void Configure()
    {
        Post("/tenants");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .Produces<TenantDto>(201)
            .ProducesProblem(400));
    }

    public override async Task HandleAsync(CreateTenantRequest req, CancellationToken ct)
    {
        var command = new CreateTenantCommand { Request = req };
        Response = await _mediator.Send(command, ct);
        HttpContext.Response.StatusCode = 201;
    }
}