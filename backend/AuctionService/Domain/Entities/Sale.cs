namespace AuctionService.Domain.Entities;

public class Sale
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid AuctionId { get; set; }
    public Guid SellerId { get; set; }
    public Guid BuyerId { get; set; }
    
    public decimal FinalPrice { get; set; }
    public DateTime SaleDate { get; set; } = DateTime.UtcNow;
}
