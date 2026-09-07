using WalletService.Application.DTOs;

namespace WalletService.Application.Interfaces;

public interface IWalletService
{
    Task<WalletDto?> GetWalletByUserIdAsync(Guid userId);
    Task<IEnumerable<WalletTransactionDto>> GetTransactionsByUserIdAsync(Guid userId);
    Task<WalletDto> DepositAsync(DepositDto depositDto);
    Task<bool> HoldEscrowAsync(HoldEscrowDto holdDto);
    Task<bool> ReleaseEscrowAsync(ReleaseEscrowDto releaseDto);
    Task<bool> TransferEscrowAsync(TransferEscrowDto transferDto);
}
