namespace AuctionService.Application.DTOs;

public class BidResultDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal CurrentPrice { get; set; }
    public Guid? LeadingUserId { get; set; }
    public DateTime EffectiveEndDate { get; set; }
    public bool AntiSnipingExtended { get; set; }
    public BidDto? Bid { get; set; }
}
