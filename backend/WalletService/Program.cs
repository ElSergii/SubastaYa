using Microsoft.EntityFrameworkCore;
using WalletService.Application.Interfaces;
using WalletService.Application.Services;
using WalletService.Infrastructure.Data;
using WalletService.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Controllers & JSON
builder.Services.AddControllers();
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

// DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost,1433;Database=SubastaYaWalletDb;User Id=sa;Password=SubastaYa2026!Password;TrustServerCertificate=True;Encrypt=False;";

builder.Services.AddDbContext<WalletDbContext>(options =>
    options.UseSqlServer(connectionString));

// Dependency Injection
builder.Services.AddScoped<IWalletRepository, WalletRepository>();
builder.Services.AddScoped<IWalletService, WalletServiceImplementation>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Auto-crear y sembrar DB en inicio si no existe
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WalletDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
