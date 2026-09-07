using Microsoft.EntityFrameworkCore;
using UserService.Domain.Entities;

namespace UserService.Infrastructure.Data;

public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        // Seed Data obligatorio
        var sellerId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var buyer1Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var buyer2Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var noFundsId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = sellerId,
                Email = "vendedor@test.com",
                Username = "vendedor",
                FullName = "Usuario Vendedor",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = buyer1Id,
                Email = "comprador1@test.com",
                Username = "comprador1",
                FullName = "Primer Comprador",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = buyer2Id,
                Email = "comprador2@test.com",
                Username = "comprador2",
                FullName = "Segundo Comprador",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = noFundsId,
                Email = "sinfondos@test.com",
                Username = "sinfondos",
                FullName = "Usuario Sin Fondos",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
