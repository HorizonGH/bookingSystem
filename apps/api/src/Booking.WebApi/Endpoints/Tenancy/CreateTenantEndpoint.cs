using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Tenancy.Commands;
using Booking.Application.Features.Tenancy.Commands.Create;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class CreateTenantEndpoint : CoreEndpoint<CreateTenantCommand, TenantDto>
{
    public CreateTenantEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/tenants");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .Produces<TenantDto>(201)
            .ProducesProblem(400));
    }

    public override async Task HandleAsync(CreateTenantCommand req, CancellationToken ct)
    {
        Response = await _mediator.Send(req, ct);
        HttpContext.Response.StatusCode = 201;
    }
}