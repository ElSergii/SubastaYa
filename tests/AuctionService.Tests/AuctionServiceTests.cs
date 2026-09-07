using AuctionService.Application.DTOs;
using AuctionService.Application.Services;
using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;
using AuctionService.Infrastructure.Data;
using AuctionService.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AuctionService.Tests;

public class AuctionServiceTests
{
    private AuctionDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AuctionDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new AuctionDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task CreateAuction_ValidData_ShouldCreateAuctionSuccessfully()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new AuctionRepository(context);
        var service = new AuctionServiceImplementation(repository);

        var category = await context.Categories.FirstAsync();
        var sellerId = Guid.NewGuid();

        var createDto = new CreateAuctionDto
        {
            Title = "Laptop Gamer Asus ROG Strix",
            Description = "Intel i9, RTX 4080, 32GB RAM",
            ImageUrl = "https://example.com/laptop.jpg",
            CategoryId = category.Id,
            StartingPrice = 50000m,
            MinimumIncrement = 2500m,
            SellerId = sellerId,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddHours(2)
        };

        // Act
        var result = await service.CreateAuctionAsync(createDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Laptop Gamer Asus ROG Strix", result.Title);
        Assert.Equal(50000m, result.StartingPrice);
        Assert.Equal(50000m, result.CurrentPrice);
        Assert.Equal(2500m, result.MinimumIncrement);
    }

    [Fact]
    public async Task PlaceBid_ValidAmount_ShouldUpdateCurrentPriceAndLeader()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var category = await context.Categories.FirstAsync();
        var sellerId = Guid.NewGuid();
        var buyerId = Guid.NewGuid();

        var activeAuction = new Auction
        {
            Id = Guid.NewGuid(),
            Title = "Subasta de prueba activa",
            Description = "Descripción de prueba",
            ImageUrl = "https://example.com/image.jpg",
            CategoryId = category.Id,
            StartingPrice = 10000m,
            CurrentPrice = 10000m,
            MinimumIncrement = 1000m,
            SellerId = sellerId,
            StartDate = DateTime.UtcNow.AddHours(-1),
            EndDate = DateTime.UtcNow.AddHours(2),
            Status = AuctionStatus.Active,
            BidCount = 0
        };

        await context.Auctions.AddAsync(activeAuction);
        await context.SaveChangesAsync();

        var repository = new AuctionRepository(context);
        var bidService = new BidServiceImplementation(repository);

        var bidAmount = activeAuction.CurrentPrice + activeAuction.MinimumIncrement + 1000m;
        var bidDto = new CreateBidDto
        {
            AuctionId = activeAuction.Id,
            UserId = buyerId,
            Amount = bidAmount
        };

        // Act
        var result = await bidService.PlaceBidAsync(bidDto);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(bidAmount, result.CurrentPrice);
        Assert.Equal(buyerId, result.LeadingUserId);
        Assert.False(result.AntiSnipingExtended);
    }

    [Fact]
    public async Task PlaceBid_AmountLessThanMinimumIncrement_ShouldThrowException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var category = await context.Categories.FirstAsync();
        var sellerId = Guid.NewGuid();
        var buyerId = Guid.NewGuid();

        var activeAuction = new Auction
        {
            Id = Guid.NewGuid(),
            Title = "Subasta de prueba incremento mínimo",
            Description = "Descripción de prueba",
            ImageUrl = "https://example.com/image.jpg",
            CategoryId = category.Id,
            StartingPrice = 10000m,
            CurrentPrice = 10000m,
            MinimumIncrement = 2000m,
            SellerId = sellerId,
            StartDate = DateTime.UtcNow.AddHours(-1),
            EndDate = DateTime.UtcNow.AddHours(2),
            Status = AuctionStatus.Active,
            BidCount = 0
        };

        await context.Auctions.AddAsync(activeAuction);
        await context.SaveChangesAsync();

        var repository = new AuctionRepository(context);
        var bidService = new BidServiceImplementation(repository);

        var invalidAmount = activeAuction.CurrentPrice + 500m; // Menor al incremento mínimo de 2000m

        var bidDto = new CreateBidDto
        {
            AuctionId = activeAuction.Id,
            UserId = buyerId,
            Amount = invalidAmount
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => bidService.PlaceBidAsync(bidDto));
    }

    [Fact]
    public async Task PlaceBid_InLast60Seconds_ShouldTriggerAntiSnipingExtension()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var category = await context.Categories.FirstAsync();
        var sellerId = Guid.NewGuid();
        var buyerId = Guid.NewGuid();

        // Subasta activa que vence en 30 segundos (Zona crítica Anti-Sniping)
        var criticalAuction = new Auction
        {
            Id = Guid.NewGuid(),
            Title = "Subasta de prueba Anti-Sniping",
            Description = "Prueba de extensión automática por 2 minutos",
            ImageUrl = "https://example.com/test.jpg",
            CategoryId = category.Id,
            StartingPrice = 10000m,
            CurrentPrice = 10000m,
            MinimumIncrement = 1000m,
            SellerId = sellerId,
            StartDate = DateTime.UtcNow.AddMinutes(-30),
            EndDate = DateTime.UtcNow.AddSeconds(30), // Faltan 30 segundos
            Status = AuctionStatus.Active,
            BidCount = 0
        };

        await context.Auctions.AddAsync(criticalAuction);
        await context.SaveChangesAsync();

        var repository = new AuctionRepository(context);
        var bidService = new BidServiceImplementation(repository);

        var bidDto = new CreateBidDto
        {
            AuctionId = criticalAuction.Id,
            UserId = buyerId,
            Amount = 12000m
        };

        // Act
        var result = await bidService.PlaceBidAsync(bidDto);

        // Assert
        Assert.True(result.Success);
        Assert.True(result.AntiSnipingExtended);
        Assert.True(result.EffectiveEndDate > criticalAuction.EndDate);
    }
}
