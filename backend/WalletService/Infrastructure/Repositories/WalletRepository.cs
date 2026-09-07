using Microsoft.EntityFrameworkCore;
using WalletService.Application.Interfaces;
using WalletService.Domain.Entities;
using WalletService.Infrastructure.Data;

namespace WalletService.Infrastructure.Repositories;

public class WalletRepository : IWalletRepository
{
    private readonly WalletDbContext _context;

    public WalletRepository(WalletDbContext context)
    {
        _context = context;
    }

    public async Task<Wallet?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Wallets
            .Include(w => w.Transactions)
            .FirstOrDefaultAsync(w => w.UserId == userId);
    }

    public async Task<Wallet?> GetByIdAsync(Guid id)
    {
        return await _context.Wallets
            .Include(w => w.Transactions)
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task AddWalletAsync(Wallet wallet)
    {
        await _context.Wallets.AddAsync(wallet);
    }

    public Task UpdateWalletAsync(Wallet wallet)
    {
        _context.Wallets.Update(wallet);
        return Task.CompletedTask;
    }

    public async Task AddTransactionAsync(WalletTransaction transaction)
    {
        await _context.WalletTransactions.AddAsync(transaction);
    }

    public async Task<IEnumerable<WalletTransaction>> GetTransactionsByWalletIdAsync(Guid walletId)
    {
        return await _context.WalletTransactions
            .Where(t => t.WalletId == walletId)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
