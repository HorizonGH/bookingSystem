# SaaS Booking Application - Database Setup

## Overview
This is a multi-tenant SaaS booking application built with .NET 9 and PostgreSQL.

## Database Architecture

### Multi-Tenancy Model
- **SuperAdmin**: You (full system access)
- **Tenants**: Businesses subscribing to the SaaS- **Plans**: Subscription tiers (Free, Basic, Professional, Enterprise)
- **Workers**: Employees of tenants who handle services
- **Clients**: End users who make reservations

### Entity Structure

#### Identity Entities
- **User**: Base user entity with multi-tenant support
- **Role**: SuperAdmin, TenantAdmin, Worker, Client
- **UserRole**: Many-to-many relationship
- **RefreshToken**: For JWT authentication

#### Tenancy Entities
- **Tenant**: Business organizations
- **Plan**: Subscription plans with features
- **TenantPlan**: Active subscriptions with billing info
- **Worker**: Tenant employees
- **Service**: Services offered by tenants
- **WorkerService**: Services each worker can perform
- **WorkerSchedule**: Worker availability
- **Reservation**: Bookings made by clients

## Prerequisites

1. **PostgreSQL 14+** installed and running
2. **.NET 9 SDK** installed
3. **Entity Framework Core tools** (installed globally)

```powershell
dotnet tool install --global dotnet-ef
```

## Database Setup

### 1. PostgreSQL Setup

Create a database and user (update credentials in appsettings.json):

```sql
CREATE DATABASE booking_saas_dev_db;
CREATE USER booking_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE booking_saas_dev_db TO booking_user;
```

### 2. Update Connection String

Update the connection string in `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=booking_saas_dev_db;Username=booking_user;Password=your_secure_password"
  }
}
```

### 3. Create Initial Migration

From the WebApi project directory:

```powershell
# Navigate to WebApi directory
cd src\Booking.WebApi

# Create initial migration
dotnet ef migrations add InitialCreate --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj

# Apply migration
dotnet ef database update --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj
```

### 4. Run the Application

```powershell
dotnet run
```

The application will automatically apply pending migrations on startup in development mode.

## Seeded Data

The initial migration includes:

### Roles
1. SuperAdmin
2. TenantAdmin
3. Worker
4. Client

### Plans
1. **Free**: 1 worker, 3 services, 50 reservations/month
2. **Basic**: $29.99/month, 3 workers, 10 services, 200 reservations/month
3. **Professional**: $79.99/month, 10 workers, 50 services, 1000 reservations/month, custom branding, analytics, API access
4. **Enterprise**: $199.99/month, unlimited workers/services/reservations, all features

## EF Core Commands Reference

### Create Migration
```powershell
dotnet ef migrations add <MigrationName> --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj
```

### Update Database
```powershell
dotnet ef database update --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj
```

### Remove Last Migration (if not applied)
```powershell
dotnet ef migrations remove --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj
```

### Generate SQL Script
```powershell
dotnet ef migrations script --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj --output migration.sql
```

### Drop Database
```powershell
dotnet ef database drop --project ..\Booking.Infrastructure\Booking.Infrastructure.csproj --startup-project .\Booking.WebApi.csproj
```

## Features

### Multi-Tenancy
- Complete tenant isolation
- Tenant-specific data and users
- SuperAdmin can access all tenants

### Subscription Management
- Multiple plans with different features
- Usage tracking (workers, services, reservations)
- Trial periods and billing cycles

### Booking System
- Service catalog per tenant
- Worker management and scheduling
- Time-based reservations
- Approval workflows
- Email/SMS notifications

### Soft Delete
- All entities support soft delete
- Global query filters automatically exclude deleted records
- Use `IgnoreQueryFilters()` to include deleted records

## Database Relationships

```
Users 1--* Tenants
Users *--* Roles (through UserRoles)
Users 1--* RefreshTokens
Users 1--* Reservations (as Client)

Tenants 1--* TenantPlans
Tenants 1--* Workers
Tenants 1--* Services
Tenants 1--* Reservations

Plans 1--* TenantPlans

Workers *--* Services (through WorkerServices)
Workers 1--* WorkerSchedules
Workers 1--* Reservations

Services 1--* Reservations
```

## Next Steps

1. ✅ Create database migrations
2. ✅ Configure PostgreSQL connection
3. 🔲 Implement authentication/authorization
4. 🔲 Create repository pattern and unit of work
5. 🔲 Implement CQRS with MediatR
6. 🔲 Add API controllers
7. 🔲 Implement business logic
8. 🔲 Add validation with FluentValidation
9. 🔲 Configure AutoMapper
10. 🔲 Add logging and error handling

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_ctl status`
- Check firewall settings
- Verify credentials in connection string

### Migration Issues
- Clear bin/obj folders and rebuild: `dotnet clean; dotnet build`
- Check for naming conflicts in entities
- Ensure all navigation properties are properly configured

### Performance
- Add indexes for frequently queried fields
- Use `.AsNoTracking()` for read-only queries
- Implement pagination for large result sets
- Consider adding Redis caching for frequent queries
