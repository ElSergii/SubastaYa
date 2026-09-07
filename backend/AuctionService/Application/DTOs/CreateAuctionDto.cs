using System.ComponentModel.DataAnnotations;

namespace AuctionService.Application.DTOs;

public class CreateAuctionDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(150, MinimumLength = 3, ErrorMessage = "El título debe tener entre 3 y 150 caracteres.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    public string Description { get; set; } = string.Empty;

    [Url(ErrorMessage = "La URL de la imagen debe ser una URL válida.")]
    public string ImageUrl { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    public Guid CategoryId { get; set; }

    [Range(0.01, 100000000.00, ErrorMessage = "El precio base debe ser mayor a 0.")]
    public decimal StartingPrice { get; set; }

    [Range(0.01, 10000000.00, ErrorMessage = "El incremento mínimo debe ser mayor a 0.")]
    public decimal MinimumIncrement { get; set; }

    [Required(ErrorMessage = "El identificador del vendedor es obligatorio.")]
    public Guid SellerId { get; set; }

    [Required(ErrorMessage = "La fecha de inicio es obligatoria.")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "La fecha de finalización es obligatoria.")]
    public DateTime EndDate { get; set; }
}
