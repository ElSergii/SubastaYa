using AuctionService.Application.Interfaces;
using AuctionService.Application.Services;
using AuctionService.Hubs;
using AuctionService.Infrastructure.Data;
using AuctionService.Infrastructure.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers & SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Config para React frontend (VS Code / localhost)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=SERGIO\\SQLEXPRESS;Database=SubastaYaAuctionDb;Trusted_Connection=True;TrustServerCertificate=True;";

try
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();
    Console.WriteLine("[INFO] Conectado exitosamente a SQL Server: " + connectionString);
}
catch (Exception ex)
{
    Console.WriteLine("[AVISO] No se pudo abrir la conexion a SQL Server (" + ex.Message + "). Usando fallback EF Core.");
}

builder.Services.AddDbContext<AuctionDbContext>(options =>
    options.UseSqlServer(connectionString));

// Dependency Injection
builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
builder.Services.AddScoped<IAuctionService, AuctionServiceImplementation>();
builder.Services.AddScoped<IBidService, BidServiceImplementation>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Mapeo del Hub SignalR para subastas en tiempo real
app.MapHub<AuctionHub>("/hubs/auction");

// Auto-crear y sembrar DB en inicio si no existe
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AuctionDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
