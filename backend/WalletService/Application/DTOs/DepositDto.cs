using System.ComponentModel.DataAnnotations;

namespace WalletService.Application.DTOs;

public class DepositDto
{
    [Required(ErrorMessage = "El identificador de usuario es obligatorio.")]
    public Guid UserId { get; set; }

    [Range(0.01, 100000000.00, ErrorMessage = "El monto a depositar debe ser mayor a 0.")]
    public decimal Amount { get; set; }
}
