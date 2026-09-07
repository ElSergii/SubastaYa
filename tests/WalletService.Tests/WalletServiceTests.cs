using Microsoft.EntityFrameworkCore;
using WalletService.Application.DTOs;
using WalletService.Application.Services;
using WalletService.Infrastructure.Data;
using WalletService.Infrastructure.Repositories;
using Xunit;

namespace WalletService.Tests;

public class WalletServiceTests
{
    private WalletDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<WalletDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new WalletDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task Deposit_ValidAmount_ShouldIncreaseTotalAndAvailableBalance()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WalletRepository(context);
        var service = new WalletServiceImplementation(repository, context);

        var userId = Guid.NewGuid();
        var depositDto = new DepositDto { UserId = userId, Amount = 50000m };

        // Act
        var result = await service.DepositAsync(depositDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(50000m, result.TotalBalance);
        Assert.Equal(50000m, result.AvailableBalance);
        Assert.Equal(0m, result.HeldBalance);
    }

    [Fact]
    public async Task HoldEscrow_SufficientFunds_ShouldDecreaseAvailableAndIncreaseHeldBalance()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WalletRepository(context);
        var service = new WalletServiceImplementation(repository, context);

        var userId = Guid.NewGuid();
        await service.DepositAsync(new DepositDto { UserId = userId, Amount = 100000m });

        var holdDto = new HoldEscrowDto
        {
            UserId = userId,
            Amount = 40000m,
            AuctionId = Guid.NewGuid()
        };

        // Act
        var success = await service.HoldEscrowAsync(holdDto);
        var wallet = await service.GetWalletByUserIdAsync(userId);

        // Assert
        Assert.True(success);
        Assert.NotNull(wallet);
        Assert.Equal(100000m, wallet.TotalBalance);
        Assert.Equal(60000m, wallet.AvailableBalance);
        Assert.Equal(40000m, wallet.HeldBalance);
    }

    [Fact]
    public async Task HoldEscrow_InsufficientFunds_ShouldThrowException()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WalletRepository(context);
        var service = new WalletServiceImplementation(repository, context);

        var userId = Guid.NewGuid();
        await service.DepositAsync(new DepositDto { UserId = userId, Amount = 500m }); // Solo 500 disponible

        var holdDto = new HoldEscrowDto
        {
            UserId = userId,
            Amount = 10000m, // Intenta retener 10.000
            AuctionId = Guid.NewGuid()
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.HoldEscrowAsync(holdDto));
    }

    [Fact]
    public async Task ReleaseEscrow_ShouldDecreaseHeldAndIncreaseAvailableBalance()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WalletRepository(context);
        var service = new WalletServiceImplementation(repository, context);

        var userId = Guid.NewGuid();
        var auctionId = Guid.NewGuid();
        await service.DepositAsync(new DepositDto { UserId = userId, Amount = 100000m });
        await service.HoldEscrowAsync(new HoldEscrowDto { UserId = userId, Amount = 30000m, AuctionId = auctionId });

        var releaseDto = new ReleaseEscrowDto
        {
            UserId = userId,
            Amount = 30000m,
            AuctionId = auctionId
        };

        // Act
        var success = await service.ReleaseEscrowAsync(releaseDto);
        var wallet = await service.GetWalletByUserIdAsync(userId);

        // Assert
        Assert.True(success);
        Assert.NotNull(wallet);
        Assert.Equal(100000m, wallet.TotalBalance);
        Assert.Equal(100000m, wallet.AvailableBalance);
        Assert.Equal(0m, wallet.HeldBalance);
    }
}
