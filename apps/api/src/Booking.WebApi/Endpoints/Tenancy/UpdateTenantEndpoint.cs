using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Tenancy.Commands;
using Booking.Application.Features.Tenancy.Commands.Update;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Tenancy;

public class UpdateTenantEndpoint : CoreEndpoint<UpdateTenantCommand, TenantDto>
{
    public UpdateTenantEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Put("/tenants/{id}");
        AllowAnonymous(); // Adjust authorization as needed
        Description(d => d
            .WithTags("Tenants")
            .Produces<TenantDto>(200)
            .ProducesProblem(400)
            .ProducesProblem(404));
    }

    public override async Task HandleAsync(UpdateTenantCommand req, CancellationToken ct)
    {
        Response = await _mediator.Send(req, ct);
        await Send.OkAsync(Response, ct);
    }
}