using System.ComponentModel.DataAnnotations;

namespace WalletService.Application.DTOs;

public class HoldEscrowDto
{
    [Required]
    public Guid UserId { get; set; }

    [Range(0.01, 100000000.00)]
    public decimal Amount { get; set; }

    public Guid AuctionId { get; set; }
}

public class ReleaseEscrowDto
{
    [Required]
    public Guid UserId { get; set; }

    [Range(0.01, 100000000.00)]
    public decimal Amount { get; set; }

    public Guid AuctionId { get; set; }
}

public class TransferEscrowDto
{
    [Required]
    public Guid BuyerUserId { get; set; }

    [Required]
    public Guid SellerUserId { get; set; }

    [Range(0.01, 100000000.00)]
    public decimal Amount { get; set; }

    public Guid AuctionId { get; set; }
}
