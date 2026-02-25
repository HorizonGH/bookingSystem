using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Images.Queries.GetAll;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Images;

public class GetTenantImagesEndpoint : CoreEndpoint<GetTenantImagesRequest, IEnumerable<TenantImageDto>>
{
    public GetTenantImagesEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Get("/tenants/{tenantId}/images");
        AllowAnonymous();

        Description(d => d
            .WithTags("Images")
            .WithSummary("Get all images for a tenant")
            .WithDescription("Returns all images associated with the tenant, ordered by DisplayOrder.")
            .Produces<IEnumerable<TenantImageDto>>(200)
            .ProducesProblem(400));
    }

    public override async Task HandleAsync(GetTenantImagesRequest req, CancellationToken ct)
    {
        try
        {
            var query = new GetTenantImagesQuery { TenantId = req.TenantId };
            Response = await _mediator.Send(query, ct);
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}

public class GetTenantImagesRequest
{
    [FastEndpoints.BindFrom("tenantId")]
    public Guid TenantId { get; set; }
}

