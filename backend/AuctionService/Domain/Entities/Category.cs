using System.ComponentModel.DataAnnotations;

namespace AuctionService.Domain.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string Icon { get; set; } = string.Empty;

    public ICollection<Auction> Auctions { get; set; } = new List<Auction>();
}
