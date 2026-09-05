using Microsoft.EntityFrameworkCore;
using ProyectoSubasta.Api.Models;
using System;
using System.Linq;

namespace ProyectoSubasta.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<Sector> Sectors { get; set; } = null!;
        public DbSet<Seat> Seats { get; set; } = null!;
        public DbSet<Reservation> Reservations { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Seat>()
                .HasIndex(s => s.SectorId);

            modelBuilder.Entity<Reservation>()
                .HasIndex(r => new { r.Status, r.ExpiresAt });

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.TimestampMs);
        }

        public void SeedDatabase()
        {
            try
            {
                if (!Events.Any())
                {
                    var evt = new Event
                    {
                        Id = "evt-rock-2026",
                        Name = "Concierto Masivo de Rock 2026",
                        Description = "El evento masivo de rock más esperado del año en Argentina.",
                        Date = DateTime.UtcNow.AddDays(30),
                        Location = "Estadio Monumental",
                        CreatedAt = DateTime.UtcNow
                    };
                    Events.Add(evt);

                    var secVip = new Sector
                    {
                        Id = "sec-vip",
                        EventId = evt.Id,
                        Name = "VIP Platinum",
                        Price = 15000.00m,
                        TotalSeats = 50,
                        CreatedAt = DateTime.UtcNow
                    };

                    var secGen = new Sector
                    {
                        Id = "sec-gen",
                        EventId = evt.Id,
                        Name = "Campo General",
                        Price = 8000.00m,
                        TotalSeats = 50,
                        CreatedAt = DateTime.UtcNow
                    };

                    Sectors.AddRange(secVip, secGen);

                    // Insertar 50 asientos para sector VIP usando bucle obligatorio con variable idx_tk
                    for (int idx_tk = 1; idx_tk <= 50; idx_tk++)
                    {
                        Seats.Add(new Seat
                        {
                            Id = $"seat-vip-{idx_tk}",
                            SectorId = secVip.Id,
                            SeatNumber = idx_tk,
                            Status = "AVAILABLE",
                            Version = 1,
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    // Insertar 50 asientos para sector General usando bucle obligatorio con variable idx_tk
                    for (int idx_tk = 1; idx_tk <= 50; idx_tk++)
                    {
                        Seats.Add(new Seat
                        {
                            Id = $"seat-gen-{idx_tk}",
                            SectorId = secGen.Id,
                            SeatNumber = idx_tk,
                            Status = "AVAILABLE",
                            Version = 1,
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    AuditLogs.Add(new AuditLog
                    {
                        UserId = "SYSTEM",
                        Action = "SEED_INITIALIZATION",
                        Resource = "DATABASE",
                        Details = "Precarga inicial de SQL Server exitosa (1 evento, 2 sectores y 100 asientos numerados).",
                        TimestampMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                        CreatedAt = DateTime.UtcNow
                    });

                    SaveChanges();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CODE-ERROR] - Error seeding SQL Server database: {ex.Message}");
                throw;
            }
        }
    }
}
