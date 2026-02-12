using System;
using Booking.Domain.Enums;

namespace Booking.Domain.Entities.Idendity;

public interface IEntity
{
    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }
    public StatusBaseEntity StatusBaseEntity { get; set; }
}
