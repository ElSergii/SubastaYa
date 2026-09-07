using WalletService.Domain.Enums;

namespace WalletService.Domain.Entities;

public class WalletTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WalletId { get; set; }
    public Wallet Wallet { get; set; } = null!;
    
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Completed;
    
    public string Description { get; set; } = string.Empty;
    public Guid? RelatedAuctionId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
