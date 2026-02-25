using Booking.Application.Common.Constants;
using Booking.Application.Common.DTOs.Tenancy;
using Booking.Application.Common.Interfaces;
using Booking.Application.Common.Mappers;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Images.Commands.Upload;

public class UploadTenantImageCommandHandler : IRequestHandler<UploadTenantImageCommand, TenantImageDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICloudinaryService _cloudinaryService;

    public UploadTenantImageCommandHandler(IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
    {
        _unitOfWork = unitOfWork;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<TenantImageDto> Handle(UploadTenantImageCommand request, CancellationToken cancellationToken)
    {
        if (request.TenantId == Guid.Empty)
            throw new InvalidOperationException("TenantId is required");

        var tenantRepo = _unitOfWork.ReadRepository<Tenant>();
        var tenant = await tenantRepo.GetByIdAsync(request.TenantId);
        if (tenant == null)
            throw new InvalidOperationException("Tenant not found");

        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll([tp => tp.Plan])
            .Where(tp => tp.TenantId == request.TenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan == null)
            throw new InvalidOperationException("Tenant does not have an active plan");

        var planType = tenantPlan.Plan.PlanType;
        var currentImages = tenantPlan.CurrentImages;

        if (!PlanLimits.CanAddImages(planType, currentImages))
        {
            var maxImages = PlanLimits.GetMaxImages(planType);
            throw new InvalidOperationException(
                $"Image limit reached. Your {planType} plan allows a maximum of {maxImages} image(s). Please upgrade your plan to upload more images.");
        }

        var folder = $"tenants/{request.TenantId}";
        var (publicId, url) = await _cloudinaryService.UploadImageAsync(
            request.ImageStream,
            request.FileName,
            folder,
            cancellationToken);

        // If this image is set as primary, unset any existing primary
        if (request.IsPrimary)
        {
            var imageRepo = _unitOfWork.ReadRepository<TenantImage>();
            var existingPrimary = await imageRepo.GetAll()
                .Where(i => i.TenantId == request.TenantId && i.IsPrimary)
                .ToListAsync(cancellationToken);

            var writeImageRepo = _unitOfWork.WriteRepository<TenantImage>();
            foreach (var img in existingPrimary)
            {
                img.IsPrimary = false;
                writeImageRepo.Update(img);
            }
        }

        var tenantImage = new TenantImage
        {
            TenantId = request.TenantId,
            PublicId = publicId,
            Url = url,
            AltText = request.AltText,
            DisplayOrder = request.DisplayOrder,
            IsPrimary = request.IsPrimary
        };

        var imageWriteRepo = _unitOfWork.WriteRepository<TenantImage>();
        await imageWriteRepo.AddAsync(tenantImage);

        tenantPlan.CurrentImages++;
        var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();
        tenantPlanWriteRepo.Update(tenantPlan);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TenantImageMapper.ToDto(tenantImage);
    }
}
