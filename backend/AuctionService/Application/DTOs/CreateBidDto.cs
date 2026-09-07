using System.ComponentModel.DataAnnotations;

namespace AuctionService.Application.DTOs;

public class CreateBidDto
{
    [Required(ErrorMessage = "El identificador de la subasta es obligatorio.")]
    public Guid AuctionId { get; set; }

    [Required(ErrorMessage = "El identificador del postor es obligatorio.")]
    public Guid UserId { get; set; }

    [Range(0.01, 100000000.00, ErrorMessage = "El monto de la puja debe ser mayor a 0.")]
    public decimal Amount { get; set; }

    public byte[]? ExpectedRowVersion { get; set; }
}
