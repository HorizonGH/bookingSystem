using System;
using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Idendity;

public class Entity : IEntity
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime Created { get; set; }

    public DateTime? LastModified { get; set; }
    public StatusBaseEntity StatusBaseEntity { get; set; }
}
