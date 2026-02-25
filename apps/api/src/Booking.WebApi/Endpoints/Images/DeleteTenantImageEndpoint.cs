using Booking.Application.Features.Images.Commands.Delete;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Images;

public class DeleteTenantImageEndpoint : CoreEndpoint<DeleteTenantImageRequest>
{
    public DeleteTenantImageEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Delete("/tenants/{tenantId}/images/{imageId}");

        Description(d => d
            .WithTags("Images")
            .WithSummary("Delete a tenant image")
            .WithDescription("Deletes an image from Cloudinary and removes it from the database.")
            .Produces(204)
            .ProducesProblem(400)
            .ProducesProblem(404));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(DeleteTenantImageRequest req, CancellationToken ct)
    {
        var command = new DeleteTenantImageCommand
        {
            ImageId = req.ImageId,
            TenantId = req.TenantId
        };

        try
        {
            await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 204;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}

public class DeleteTenantImageRequest
{
    [FastEndpoints.BindFrom("tenantId")]
    public Guid TenantId { get; set; }

    [FastEndpoints.BindFrom("imageId")]
    public Guid ImageId { get; set; }
}
