namespace AuctionService.Domain.Entities;

public class Bid
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public DateTime BidTime { get; set; } = DateTime.UtcNow;
    
    public bool IsWinningBid { get; set; } = false;
}
