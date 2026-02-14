using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints;

public abstract class CoreEndpoint<TRequest, TResponse> : Endpoint<TRequest, TResponse>
{
    protected readonly IMediator _mediator;
    protected CoreEndpoint(IMediator mediator) => _mediator = mediator;

    public override void Configure() => Throttle(10, 60);
}

public abstract class CoreEndpoint<TRequest> : Endpoint<TRequest>
{
    protected readonly IMediator _mediator;
    protected CoreEndpoint(IMediator mediator) => _mediator = mediator;

    public override void Configure() => Throttle(10, 60);
}

public abstract class CoreEndpointWithoutRequest<TResponse> : EndpointWithoutRequest<TResponse>
{
    protected readonly IMediator _mediator;
    protected CoreEndpointWithoutRequest(IMediator mediator) => _mediator = mediator;

    public override void Configure() => Throttle(10, 60);
}

public abstract class CoreEndpointWithoutRequest : EndpointWithoutRequest
{
    protected readonly IMediator _mediator;
    protected CoreEndpointWithoutRequest(IMediator mediator) => _mediator = mediator;

    public override void Configure() => Throttle(10, 60);
}