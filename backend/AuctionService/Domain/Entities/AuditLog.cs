using System.ComponentModel.DataAnnotations;

namespace AuctionService.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string EventType { get; set; } = string.Empty;
    
    public Guid? EntityId { get; set; }
    
    [MaxLength(100)]
    public string EntityName { get; set; } = string.Empty;
    
    public Guid? UserId { get; set; }
    
    [Required]
    public string Details { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string IpAddress { get; set; } = "127.0.0.1";
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
