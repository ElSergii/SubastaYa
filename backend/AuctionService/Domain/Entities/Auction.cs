using System.ComponentModel.DataAnnotations;
using AuctionService.Domain.Enums;

namespace AuctionService.Domain.Entities;

public class Auction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;
    
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public decimal StartingPrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public decimal MinimumIncrement { get; set; }
    
    public Guid SellerId { get; set; }
    public Guid? WinnerId { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? ExtendedUntil { get; set; }
    
    public AuctionStatus Status { get; set; } = AuctionStatus.Active;
    public int BidCount { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<Bid> Bids { get; set; } = new List<Bid>();
}
