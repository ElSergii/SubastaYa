using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using WalletService.Application.Interfaces;
using WalletService.Application.Services;
using WalletService.Infrastructure.Data;
using WalletService.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
    ?? "Server=SERGIO\\SQLEXPRESS;Database=SubastaYaWalletDb;Trusted_Connection=True;TrustServerCertificate=True;";

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

builder.Services.AddDbContext<WalletDbContext>(options =>
    options.UseSqlServer(connectionString));

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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WalletDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
