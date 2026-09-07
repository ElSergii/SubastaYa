namespace AuctionService.Application.DTOs;

public class BidDto
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public DateTime BidTime { get; set; }
    public bool IsWinningBid { get; set; }
}
