using WalletService.Domain.Entities;

namespace WalletService.Application.Interfaces;

public interface IWalletRepository
{
    Task<Wallet?> GetByUserIdAsync(Guid userId);
    Task<Wallet?> GetByIdAsync(Guid id);
    Task AddWalletAsync(Wallet wallet);
    Task UpdateWalletAsync(Wallet wallet);
    Task AddTransactionAsync(WalletTransaction transaction);
    Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(Guid walletId);
    Task SaveChangesAsync();
}
