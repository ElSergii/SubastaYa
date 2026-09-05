using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoSubasta.Api.Models
{
    public class Event
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Sector
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [Required]
        public string EventId { get; set; } = string.Empty;

        [ForeignKey(nameof(EventId))]
        public Event? Event { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int TotalSeats { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Seat
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [Required]
        public string SectorId { get; set; } = string.Empty;

        [ForeignKey(nameof(SectorId))]
        public Sector? Sector { get; set; }

        public int SeatNumber { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "AVAILABLE"; // AVAILABLE, RESERVED, SOLD

        [ConcurrencyCheck]
        public int Version { get; set; } = 1;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Reservation
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [Required]
        public string SeatId { get; set; } = string.Empty;

        [ForeignKey(nameof(SeatId))]
        public Seat? Seat { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, COMPLETED, EXPIRED

        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AuditLog
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Resource { get; set; } = string.Empty;

        [Required]
        public string Details { get; set; } = string.Empty;

        public long TimestampMs { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
