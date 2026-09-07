using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Infrastructure.Data;

public class AuctionDbContext : DbContext
{
    public AuctionDbContext(DbContextOptions<AuctionDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Auction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
            entity.Property(e => e.StartingPrice).HasPrecision(18, 2);
            entity.Property(e => e.CurrentPrice).HasPrecision(18, 2);
            entity.Property(e => e.MinimumIncrement).HasPrecision(18, 2);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.RowVersion).IsRowVersion();

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Auctions)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Bid>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);

            entity.HasOne(e => e.Auction)
                  .WithMany(a => a.Bids)
                  .HasForeignKey(e => e.AuctionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FinalPrice).HasPrecision(18, 2);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EventType).IsRequired().HasMaxLength(100);
        });

        // Seed Data
        var catTech = Guid.Parse("c1111111-1111-1111-1111-111111111111");
        var catCol = Guid.Parse("c2222222-2222-2222-2222-222222222222");
        var catApp = Guid.Parse("c3333333-3333-3333-3333-333333333333");
        var catVeh = Guid.Parse("c4444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = catTech, Name = "Tecnología", Description = "Laptops, Smartphones, Consolas y Gadgets", Icon = "Computer" },
            new Category { Id = catCol, Name = "Coleccionables", Description = "Arte, Antigüedades, Relojes y Rarezas", Icon = "Diamond" },
            new Category { Id = catApp, Name = "Indumentaria", Description = "Ropa Vintage, Zapatillas y Accesorios de Lujo", Icon = "Checkroom" },
            new Category { Id = catVeh, Name = "Vehículos", Description = "Autos, Motos, Scooters y Movilidad", Icon = "DirectionsCar" }
        );

        var sellerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var buyer1Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var buyer2Id = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var auc1 = Guid.Parse("a1111111-1111-1111-1111-111111111111");
        var auc2 = Guid.Parse("a2222222-2222-2222-2222-222222222222");
        var auc3 = Guid.Parse("a3333333-3333-3333-3333-333333333333");
        var auc4 = Guid.Parse("a4444444-4444-4444-4444-444444444444");
        var auc5 = Guid.Parse("a5555555-5555-5555-5555-555555555555");

        var now = new DateTime(2026, 9, 7, 16, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<Auction>().HasData(
            new Auction
            {
                Id = auc1,
                Title = "MacBook Pro M3 Max 16 inch 36GB RAM",
                Description = "Laptop profesional Apple M3 Max en estado impecable con caja original y cargador 140W.",
                ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                CategoryId = catTech,
                StartingPrice = 30000m,
                CurrentPrice = 45000m,
                MinimumIncrement = 2000m,
                SellerId = sellerId,
                WinnerId = buyer1Id,
                StartDate = now.AddHours(-1),
                EndDate = now.AddMinutes(25),
                Status = AuctionStatus.Active,
                BidCount = 2,
                CreatedAt = now.AddHours(-1)
            },
            new Auction
            {
                Id = auc2,
                Title = "Reloj Rolex Submariner Date 1998 Original",
                Description = "Edición de colección con certificado de autenticidad y service reciente.",
                ImageUrl = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
                CategoryId = catCol,
                StartingPrice = 100000m,
                CurrentPrice = 120000m,
                MinimumIncrement = 5000m,
                SellerId = sellerId,
                WinnerId = buyer2Id,
                StartDate = now.AddHours(-2),
                EndDate = now.AddSeconds(45), // Menos de 60s -> Zona Crítica Anti-Sniping
                Status = AuctionStatus.Active,
                BidCount = 1,
                CreatedAt = now.AddHours(-2)
            },
            new Auction
            {
                Id = auc3,
                Title = "Guitarra Gibson Les Paul Standard 1959 Reissue",
                Description = "Instrumento de gama alta con estuche rigido Custom Shop.",
                ImageUrl = "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80",
                CategoryId = catCol,
                StartingPrice = 80000m,
                CurrentPrice = 80000m,
                MinimumIncrement = 2500m,
                SellerId = sellerId,
                WinnerId = null,
                StartDate = now.AddHours(24),
                EndDate = now.AddHours(48),
                Status = AuctionStatus.Upcoming,
                BidCount = 0,
                CreatedAt = now
            },
            new Auction
            {
                Id = auc4,
                Title = "Chaqueta de Cuero Vintage Schott NYC",
                Description = "Chaqueta clásica de cuero vacuno talle M en excelente estado.",
                ImageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                CategoryId = catApp,
                StartingPrice = 15000m,
                CurrentPrice = 28000m,
                MinimumIncrement = 1000m,
                SellerId = sellerId,
                WinnerId = buyer1Id,
                StartDate = now.AddDays(-2),
                EndDate = now.AddHours(-1),
                Status = AuctionStatus.Active, // Lista para ser procesada por Worker
                BidCount = 3,
                CreatedAt = now.AddDays(-2)
            },
            new Auction
            {
                Id = auc5,
                Title = "Scooter Eléctrico Xiaomi Pro 2",
                Description = "Scooter urbano 45km autonomía con freno de disco y pantalla digital.",
                ImageUrl = "https://images.unsplash.com/photo-1597086884617-64b58e72efcb?auto=format&fit=crop&w=800&q=80",
                CategoryId = catVeh,
                StartingPrice = 50000m,
                CurrentPrice = 50000m,
                MinimumIncrement = 2000m,
                SellerId = sellerId,
                WinnerId = null,
                StartDate = now.AddDays(-3),
                EndDate = now.AddHours(-2),
                Status = AuctionStatus.Active, // Sin pujas, lista para pasar a DESIERTA por Worker
                BidCount = 0,
                CreatedAt = now.AddDays(-3)
            }
        );

        modelBuilder.Entity<Bid>().HasData(
            new Bid
            {
                Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
                AuctionId = auc1,
                UserId = buyer2Id,
                Amount = 35000m,
                BidTime = now.AddMinutes(-45),
                IsWinningBid = false
            },
            new Bid
            {
                Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                AuctionId = auc1,
                UserId = buyer1Id,
                Amount = 45000m,
                BidTime = now.AddMinutes(-30),
                IsWinningBid = true
            },
            new Bid
            {
                Id = Guid.Parse("b3333333-3333-3333-3333-333333333333"),
                AuctionId = auc2,
                UserId = buyer2Id,
                Amount = 120000m,
                BidTime = now.AddMinutes(-10),
                IsWinningBid = true
            },
            new Bid
            {
                Id = Guid.Parse("b4444444-4444-4444-4444-444444444444"),
                AuctionId = auc4,
                UserId = buyer1Id,
                Amount = 28000m,
                BidTime = now.AddHours(-2),
                IsWinningBid = true
            }
        );
    }
}
