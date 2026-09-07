namespace WalletService.Application.DTOs;

public class WalletDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal TotalBalance { get; set; }
    public decimal AvailableBalance { get; set; }
    public decimal HeldBalance { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
