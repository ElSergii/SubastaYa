using WalletService.Application.DTOs;
using WalletService.Application.Interfaces;
using WalletService.Domain.Entities;
using WalletService.Domain.Enums;
using WalletService.Infrastructure.Data;

namespace WalletService.Application.Services;

public class WalletServiceImplementation : IWalletService
{
    private readonly IWalletRepository _walletRepository;
    private readonly WalletDbContext _context;

    public WalletServiceImplementation(IWalletRepository walletRepository, WalletDbContext context)
    {
        _walletRepository = walletRepository;
        _context = context;
    }

    public async Task<WalletDto?> GetWalletByUserIdAsync(Guid userId)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(userId);
        return wallet == null ? null : MapToDto(wallet);
    }

    public async Task<IEnumerable<WalletTransactionDto>> GetTransactionsByUserIdAsync(Guid userId)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(userId);
        if (wallet == null) return Enumerable.Empty<WalletTransactionDto>();

        var transactions = await _walletRepository.GetTransactionsByWalletIdAsync(wallet.Id);
        return transactions.Select(t => new WalletTransactionDto
        {
            Id = t.Id,
            WalletId = t.WalletId,
            Type = t.Type.ToString(),
            Amount = t.Amount,
            Status = t.Status.ToString(),
            Description = t.Description,
            RelatedAuctionId = t.RelatedAuctionId,
            CreatedAt = t.CreatedAt
        });
    }

    public async Task<WalletDto> DepositAsync(DepositDto depositDto)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(depositDto.UserId);
        if (wallet == null)
        {
            wallet = new Wallet
            {
                Id = Guid.NewGuid(),
                UserId = depositDto.UserId,
                TotalBalance = 0m,
                AvailableBalance = 0m,
                HeldBalance = 0m
            };
            await _walletRepository.AddWalletAsync(wallet);
        }

        wallet.TotalBalance += depositDto.Amount;
        wallet.AvailableBalance += depositDto.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            Type = TransactionType.Deposit,
            Amount = depositDto.Amount,
            Status = TransactionStatus.Completed,
            Description = $"Depósito simulado de ${depositDto.Amount:N2}",
            CreatedAt = DateTime.UtcNow
        };

        await _walletRepository.AddTransactionAsync(transaction);
        await _walletRepository.SaveChangesAsync();

        return MapToDto(wallet);
    }

    // Regla Escrow: Retiene el monto del postor líder aumentando HeldBalance y reduciendo AvailableBalance.
    public async Task<bool> HoldEscrowAsync(HoldEscrowDto holdDto)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(holdDto.UserId);
        if (wallet == null || wallet.AvailableBalance < holdDto.Amount)
        {
            throw new InvalidOperationException("Saldo disponible insuficiente para realizar la oferta.");
        }

        wallet.AvailableBalance -= holdDto.Amount;
        wallet.HeldBalance += holdDto.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            Type = TransactionType.Hold,
            Amount = holdDto.Amount,
            Status = TransactionStatus.Completed,
            Description = $"Retención Escrow por oferta en subasta",
            RelatedAuctionId = holdDto.AuctionId,
            CreatedAt = DateTime.UtcNow
        };

        await _walletRepository.AddTransactionAsync(transaction);
        await _walletRepository.SaveChangesAsync();

        return true;
    }

    // Regla Escrow: Libera la retención previa devuelviendo el dinero al saldo disponible del usuario superado.
    public async Task<bool> ReleaseEscrowAsync(ReleaseEscrowDto releaseDto)
    {
        var wallet = await _walletRepository.GetByUserIdAsync(releaseDto.UserId);
        if (wallet == null) return false;

        decimal amountToRelease = Math.Min(wallet.HeldBalance, releaseDto.Amount);

        wallet.HeldBalance -= amountToRelease;
        wallet.AvailableBalance += amountToRelease;
        wallet.UpdatedAt = DateTime.UtcNow;

        var transaction = new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            Type = TransactionType.Release,
            Amount = amountToRelease,
            Status = TransactionStatus.Completed,
            Description = $"Liberación Escrow por oferta superada en subasta",
            RelatedAuctionId = releaseDto.AuctionId,
            CreatedAt = DateTime.UtcNow
        };

        await _walletRepository.AddTransactionAsync(transaction);
        await _walletRepository.SaveChangesAsync();

        return true;
    }

    // Regla Escrow: Transfiere de forma atómica (ACID) el monto retenido del comprador ganador al vendedor.
    public async Task<bool> TransferEscrowAsync(TransferEscrowDto transferDto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var buyerWallet = await _walletRepository.GetByUserIdAsync(transferDto.BuyerUserId);
            var sellerWallet = await _walletRepository.GetByUserIdAsync(transferDto.SellerUserId);

            if (buyerWallet == null || sellerWallet == null)
            {
                throw new InvalidOperationException("Billetera del comprador o vendedor no encontrada.");
            }

            // Débito final del comprador (descuenta de fondos retenidos y del saldo total)
            buyerWallet.HeldBalance -= transferDto.Amount;
            buyerWallet.TotalBalance -= transferDto.Amount;
            buyerWallet.UpdatedAt = DateTime.UtcNow;

            await _walletRepository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = buyerWallet.Id,
                Type = TransactionType.FinalDebit,
                Amount = transferDto.Amount,
                Status = TransactionStatus.Completed,
                Description = $"Débito final por adjudicación de subasta",
                RelatedAuctionId = transferDto.AuctionId,
                CreatedAt = DateTime.UtcNow
            });

            // Acreditación al vendedor
            sellerWallet.TotalBalance += transferDto.Amount;
            sellerWallet.AvailableBalance += transferDto.Amount;
            sellerWallet.UpdatedAt = DateTime.UtcNow;

            await _walletRepository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = sellerWallet.Id,
                Type = TransactionType.Deposit,
                Amount = transferDto.Amount,
                Status = TransactionStatus.Completed,
                Description = $"Pago recibido por venta en subasta",
                RelatedAuctionId = transferDto.AuctionId,
                CreatedAt = DateTime.UtcNow
            });

            await _walletRepository.SaveChangesAsync();
            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private static WalletDto MapToDto(Wallet wallet)
    {
        return new WalletDto
        {
            Id = wallet.Id,
            UserId = wallet.UserId,
            TotalBalance = wallet.TotalBalance,
            AvailableBalance = wallet.AvailableBalance,
            HeldBalance = wallet.HeldBalance,
            RowVersion = wallet.RowVersion
        };
    }
}
