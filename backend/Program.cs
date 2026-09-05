using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProyectoSubasta.Api.Data;
using ProyectoSubasta.Api.Middleware;
using ProyectoSubasta.Api.Services;
using ProyectoSubasta.Api.Workers;
using System;

var builder = WebApplication.CreateBuilder(args);

// Configurar Cadena de Conexión a SQL Server Express local
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost\\SQLEXPRESS;Database=ProyectoSubastaDb;Trusted_Connection=True;TrustServerCertificate=True;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Inyección de Servicios
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<ISeatService, SeatService>();

// Inyección del Worker en Segundo Plano (BackgroundService)
builder.Services.AddHostedService<ReservationWorker>();

// Controladores y CORS
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Plataforma de Venta de Entradas (ASP.NET Core 9 + SQL Server)",
        Version = "v1",
        Description = "API RESTful corporativa en C# con Entity Framework Core, Optimistic Locking, transacciones ACID y background worker."
    });
});

var app = builder.Build();

// Garantizar creación de Base de Datos SQL Server y precarga de semillas
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();
        db.SeedDatabase();
        Console.WriteLine("✅ [DATABASE INITIALIZED] SQL Server Express inicializado correctamente con tablas y datos de prueba.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CODE-ERROR] - Error inicializando la base de datos SQL Server: {ex.Message}");
    }
}

// Swagger en desarrollo y producción
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Plataforma Venta Entradas API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

// REQUERIMIENTO CORPORATIVO 3: Inyectar middleware global para el header X-Api-version: 1.0
app.UseMiddleware<CorporateHeaderMiddleware>();

app.MapControllers();

Console.WriteLine("🚀 Servidor ASP.NET Core 9 Web API iniciado en http://localhost:5000");
Console.WriteLine("📄 Documentación Swagger disponible en http://localhost:5000/swagger");

app.Run("http://localhost:5000");
