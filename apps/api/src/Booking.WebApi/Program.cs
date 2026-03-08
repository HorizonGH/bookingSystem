using Booking.Application.Common.Interfaces;
using Booking.Application.Extensions;
using Booking.Infrastructure.Extensions;
using Booking.Infrastructure.Persistence;
using Booking.WebApi.Services;
using FastEndpoints;
using FastEndpoints.Swagger;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Bind to PORT env var provided by Render (falls back to 8080 locally)
var port = Environment.GetEnvironmentVariable("PORT") ?? "3000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

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

// Always run migrations on startup (covers both Development and Production/Render)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
    await dbContext.Database.MigrateAsync();
}

// Only redirect HTTPS locally — Render handles SSL termination at the load balancer
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowAll");
// Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Use FastEndpoints
app.UseFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api";
});

// Use Swagger in all environments so the deployed API is explorable
app.UseSwaggerGen();

app.Run();

