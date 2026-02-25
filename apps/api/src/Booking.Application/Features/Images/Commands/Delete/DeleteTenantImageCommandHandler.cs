using Booking.Application.Common.Interfaces;
using Booking.Domain.Entities.Tenancy;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Booking.Application.Features.Images.Commands.Delete;

public class DeleteTenantImageCommandHandler : IRequestHandler<DeleteTenantImageCommand, bool>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICloudinaryService _cloudinaryService;

    public DeleteTenantImageCommandHandler(IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
    {
        _unitOfWork = unitOfWork;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<bool> Handle(DeleteTenantImageCommand request, CancellationToken cancellationToken)
    {
        var imageRepo = _unitOfWork.ReadRepository<TenantImage>();
        var image = await imageRepo.GetByIdAsync(request.ImageId);

        if (image == null)
            throw new InvalidOperationException("Image not found");

        if (image.TenantId != request.TenantId)
            throw new InvalidOperationException("Image does not belong to this tenant");

        // Delete from Cloudinary
        await _cloudinaryService.DeleteImageAsync(image.PublicId, cancellationToken);

        // Remove from database
        var writeRepo = _unitOfWork.WriteRepository<TenantImage>();
        writeRepo.Remove(image);

        // Decrement usage counter
        var tenantPlanRepo = _unitOfWork.ReadRepository<TenantPlan>();
        var tenantPlan = await tenantPlanRepo
            .GetAll()
            .Where(tp => tp.TenantId == request.TenantId)
            .OrderByDescending(tp => tp.Created)
            .FirstOrDefaultAsync(cancellationToken);

        if (tenantPlan != null && tenantPlan.CurrentImages > 0)
        {
            tenantPlan.CurrentImages--;
            var tenantPlanWriteRepo = _unitOfWork.WriteRepository<TenantPlan>();
            tenantPlanWriteRepo.Update(tenantPlan);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
