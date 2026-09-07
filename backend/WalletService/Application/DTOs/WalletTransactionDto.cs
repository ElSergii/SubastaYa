namespace WalletService.Application.DTOs;

public class WalletTransactionDto
{
    public Guid Id { get; set; }
    public Guid WalletId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid? RelatedAuctionId { get; set; }
    public DateTime CreatedAt { get; set; }
}
