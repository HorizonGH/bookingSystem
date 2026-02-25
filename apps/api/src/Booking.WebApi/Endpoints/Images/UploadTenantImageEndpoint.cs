using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Features.Images.Commands.Upload;
using FastEndpoints;
using MediatR;

namespace Booking.WebApi.Endpoints.Images;

public class UploadTenantImageEndpoint : CoreEndpoint<UploadTenantImageRequest, TenantImageDto>
{
    public UploadTenantImageEndpoint(IMediator mediator) : base(mediator) { }

    public override void Configure()
    {
        Post("/tenants/{tenantId}/images");
        AllowFileUploads();

        Description(d => d
            .WithTags("Images")
            .WithSummary("Upload a tenant image")
            .WithDescription("Uploads an image to Cloudinary and links it to the tenant. Image count is limited by the tenant's plan.")
            .Produces<TenantImageDto>(201)
            .ProducesProblem(400));

        Roles("TenantAdmin");
    }

    public override async Task HandleAsync(UploadTenantImageRequest req, CancellationToken ct)
    {
        if (req.File == null)
        {
            ThrowError("No image file was provided", 400);
            return;
        }

        var file = req.File;
        using var stream = file.OpenReadStream();

        var command = new UploadTenantImageCommand
        {
            TenantId = req.TenantId,
            ImageStream = stream,
            FileName = file.FileName,
            AltText = req.AltText,
            DisplayOrder = req.DisplayOrder,
            IsPrimary = req.IsPrimary
        };

        try
        {
            Response = await _mediator.Send(command, ct);
            HttpContext.Response.StatusCode = 201;
        }
        catch (InvalidOperationException ex)
        {
            ThrowError(ex.Message, 400);
        }
    }
}

public class UploadTenantImageRequest
{
    [FastEndpoints.BindFrom("tenantId")]
    public Guid TenantId { get; set; }

    // included so swagger can render file selector
    public IFormFile? File { get; set; }

    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;
    public bool IsPrimary { get; set; } = false;
}
