using AuctionService.Infrastructure.Data;
using AuctionWorker;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost,1433;Database=SubastaYaAuctionDb;User Id=sa;Password=SubastaYa2026!Password;TrustServerCertificate=True;Encrypt=False;";

bool sqlAvailable = false;
try
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();
    sqlAvailable = true;
}
catch
{
    sqlAvailable = false;
}

if (sqlAvailable)
{
    builder.Services.AddDbContext<AuctionDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    builder.Services.AddDbContext<AuctionDbContext>(options =>
        options.UseInMemoryDatabase("SubastaYaAuctionDb"));
}

builder.Services.AddHttpClient();
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
