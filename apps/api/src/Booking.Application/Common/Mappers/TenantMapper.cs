using Booking.Application.Common.DTOs.Tenancy;
using Booking.Domain.Entities.Tenancy;
using Riok.Mapperly.Abstractions;

namespace Booking.Application.Common.Mappers;

[Mapper]
public static partial class TenantMapper
{
    [MapperIgnoreSource(nameof(Tenant.TenantPlans))]
    [MapperIgnoreSource(nameof(Tenant.Users))]
    [MapperIgnoreSource(nameof(Tenant.Workers))]
    [MapperIgnoreSource(nameof(Tenant.Services))]
    [MapperIgnoreSource(nameof(Tenant.Reservations))]
    [MapperIgnoreSource(nameof(Tenant.StatusBaseEntity))]
    public static partial TenantDto ToDto(Tenant tenant);

    [MapperIgnoreTarget(nameof(Tenant.TenantPlans))]
    [MapperIgnoreTarget(nameof(Tenant.Users))]
    [MapperIgnoreTarget(nameof(Tenant.Workers))]
    [MapperIgnoreTarget(nameof(Tenant.Services))]
    [MapperIgnoreTarget(nameof(Tenant.Reservations))]
    [MapperIgnoreTarget(nameof(Tenant.Id))]
    [MapperIgnoreTarget(nameof(Tenant.Created))]
    [MapperIgnoreTarget(nameof(Tenant.LastModified))]
    [MapperIgnoreTarget(nameof(Tenant.StatusBaseEntity))]
    public static partial Tenant ToEntity(CreateTenantRequest request);

    [MapperIgnoreTarget(nameof(Tenant.TenantPlans))]
    [MapperIgnoreTarget(nameof(Tenant.Users))]
    [MapperIgnoreTarget(nameof(Tenant.Workers))]
    [MapperIgnoreTarget(nameof(Tenant.Services))]
    [MapperIgnoreTarget(nameof(Tenant.Reservations))]
    [MapperIgnoreTarget(nameof(Tenant.Id))]
    [MapperIgnoreTarget(nameof(Tenant.Created))]
    [MapperIgnoreTarget(nameof(Tenant.LastModified))]
    [MapperIgnoreTarget(nameof(Tenant.StatusBaseEntity))]
    [MapperIgnoreSource(nameof(UpdateTenantRequest.Id))]
    public static partial void UpdateEntity(UpdateTenantRequest request, Tenant tenant);
}