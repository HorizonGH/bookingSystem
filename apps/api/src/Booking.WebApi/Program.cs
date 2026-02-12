using Booking.Application.Common.Interfaces;
using Booking.Application.Extensions;
using Booking.Infrastructure.Extensions;
using Booking.Infrastructure.Persistence;
using Booking.WebApi.Services;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add HttpContextAccessor for CurrentUserService
builder.Services.AddHttpContextAccessor();

// Register CurrentUserService
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Add Application layer (MediatR)
builder.Services.AddApplication();

// Add Infrastructure layer with Database and Authentication
builder.Services.AddInfrastructure(builder.Configuration);

// Add FastEndpoints
builder.Services.AddFastEndpoints();

// Add Swagger with JWT support
builder.Services.SwaggerDocument(o =>
{
    o.DocumentSettings = s =>
    {
        s.Title = "Booking SaaS API";
        s.Version = "v1";
        s.Description = "Multi-tenant SaaS booking application API";
    };
    o.EnableJWTBearerAuth = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Auto-migrate database in development
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.UseHttpsRedirection();

// Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Use FastEndpoints
app.UseFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api";
});

// Use Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerGen();
}

app.Run();

