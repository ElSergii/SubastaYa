using Microsoft.EntityFrameworkCore;
using WalletService.Domain.Entities;
using WalletService.Domain.Enums;

namespace WalletService.Infrastructure.Data;

public class WalletDbContext : DbContext
{
    public WalletDbContext(DbContextOptions<WalletDbContext> options) : base(options) { }

    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.TotalBalance).HasPrecision(18, 2);
            entity.Property(e => e.AvailableBalance).HasPrecision(18, 2);
            entity.Property(e => e.HeldBalance).HasPrecision(18, 2);
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        modelBuilder.Entity<WalletTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Type).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Wallet)
                  .WithMany(w => w.Transactions)
                  .HasForeignKey(e => e.WalletId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed Data
        var sellerUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var buyer1UserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var buyer2UserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var noFundsUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        var sellerWalletId = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var buyer1WalletId = Guid.Parse("20000000-0000-0000-0000-000000000002");
        var buyer2WalletId = Guid.Parse("30000000-0000-0000-0000-000000000003");
        var noFundsWalletId = Guid.Parse("40000000-0000-0000-0000-000000000004");

        modelBuilder.Entity<Wallet>().HasData(
            new Wallet
            {
                Id = sellerWalletId,
                UserId = sellerUserId,
                TotalBalance = 0m,
                HeldBalance = 0m,
                AvailableBalance = 0m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Wallet
            {
                Id = buyer1WalletId,
                UserId = buyer1UserId,
                TotalBalance = 150000m,
                HeldBalance = 45000m,
                AvailableBalance = 105000m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Wallet
            {
                Id = buyer2WalletId,
                UserId = buyer2UserId,
                TotalBalance = 200000m,
                HeldBalance = 0m,
                AvailableBalance = 200000m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new Wallet
            {
                Id = noFundsWalletId,
                UserId = noFundsUserId,
                TotalBalance = 500m,
                HeldBalance = 0m,
                AvailableBalance = 500m,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<WalletTransaction>().HasData(
            new WalletTransaction
            {
                Id = Guid.Parse("90000000-0000-0000-0000-000000000001"),
                WalletId = buyer1WalletId,
                Type = TransactionType.Deposit,
                Amount = 150000m,
                Status = TransactionStatus.Completed,
                Description = "Depósito inicial de saldo",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new WalletTransaction
            {
                Id = Guid.Parse("90000000-0000-0000-0000-000000000002"),
                WalletId = buyer1WalletId,
                Type = TransactionType.Hold,
                Amount = 45000m,
                Status = TransactionStatus.Completed,
                Description = "Retención de puja en subasta activa MacBook Pro M3",
                RelatedAuctionId = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
                CreatedAt = new DateTime(2026, 1, 1, 1, 0, 0, DateTimeKind.Utc)
            },
            new WalletTransaction
            {
                Id = Guid.Parse("90000000-0000-0000-0000-000000000003"),
                WalletId = buyer2WalletId,
                Type = TransactionType.Deposit,
                Amount = 200000m,
                Status = TransactionStatus.Completed,
                Description = "Depósito inicial de saldo",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new WalletTransaction
            {
                Id = Guid.Parse("90000000-0000-0000-0000-000000000004"),
                WalletId = noFundsWalletId,
                Type = TransactionType.Deposit,
                Amount = 500m,
                Status = TransactionStatus.Completed,
                Description = "Depósito inicial de prueba de saldo insuficiente",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
