using Booking.Application.Common.DTOs.Auth;
using Booking.Application.Common.Interfaces;
using Booking.Application.Features.Auth.Queries.Me;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Auth;

public class MeEndpoint : CoreEndpointWithoutRequest<GetProfileInfoResponse>
{

    public MeEndpoint(IMediator mediator) : base(mediator)
    {
    }

    public override void Configure()
    {
        Get("/auth/me");
        Summary(s =>
        {
            s.Summary = "Get current user information";
            s.Description = "Returns information about the authenticated user";
        });
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var query = new GetProfileInfoQuery();
        var result = await _mediator.Send(query, ct);
        await Send.OkAsync(result, ct);
    }
}
