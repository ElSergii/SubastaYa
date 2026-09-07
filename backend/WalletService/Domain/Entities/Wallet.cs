using System.ComponentModel.DataAnnotations;

namespace WalletService.Domain.Entities;

public class Wallet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    
    public decimal TotalBalance { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal HeldBalance { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
