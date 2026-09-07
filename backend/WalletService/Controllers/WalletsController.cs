using Microsoft.AspNetCore.Mvc;
using WalletService.Application.DTOs;
using WalletService.Application.Interfaces;

namespace WalletService.Controllers;

[ApiController]
[Route("api/v1/wallets")]
public class WalletsController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletsController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    /// <summary>
    /// Obtiene la billetera y el desglose de saldos de un usuario.
    /// </summary>
    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(WalletDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWallet(Guid userId)
    {
        var wallet = await _walletService.GetWalletByUserIdAsync(userId);
        if (wallet == null)
        {
            return NotFound(new { error = $"No se encontró la billetera para el usuario {userId}" });
        }
        return Ok(wallet);
    }

    /// <summary>
    /// Obtiene el historial de movimientos de billetera (Ledger).
    /// </summary>
    [HttpGet("{userId:guid}/transactions")]
    [ProducesResponseType(typeof(IEnumerable<WalletTransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactions(Guid userId)
    {
        var transactions = await _walletService.GetTransactionsByUserIdAsync(userId);
        return Ok(transactions);
    }

    /// <summary>
    /// Realiza un depósito simulado de saldo en la billetera.
    /// </summary>
    [HttpPost("{userId:guid}/deposit")]
    [ProducesResponseType(typeof(WalletDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Deposit(Guid userId, [FromBody] DepositDto depositDto)
    {
        if (userId != depositDto.UserId)
        {
            return BadRequest(new { error = "El ID de usuario en la URL no coincide con el cuerpo de la solicitud." });
        }

        var result = await _walletService.DepositAsync(depositDto);
        return Ok(result);
    }

    /// <summary>
    /// Retiene fondos de la billetera por una nueva puja (Escrow).
    /// </summary>
    [HttpPost("escrow/hold")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> HoldEscrow([FromBody] HoldEscrowDto holdDto)
    {
        try
        {
            var success = await _walletService.HoldEscrowAsync(holdDto);
            return Ok(new { success, message = "Retención de fondos realizada con éxito." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Libera la retención de fondos del postor superado (Escrow).
    /// </summary>
    [HttpPost("escrow/release")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ReleaseEscrow([FromBody] ReleaseEscrowDto releaseDto)
    {
        var success = await _walletService.ReleaseEscrowAsync(releaseDto);
        return Ok(new { success, message = "Fondos liberados con éxito." });
    }

    /// <summary>
    /// Transfiere el dinero retenido del comprador ganador al vendedor (Liquidación Escrow).
    /// </summary>
    [HttpPost("escrow/transfer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TransferEscrow([FromBody] TransferEscrowDto transferDto)
    {
        try
        {
            var success = await _walletService.TransferEscrowAsync(transferDto);
            return Ok(new { success, message = "Transferencia de liquidación completada exitosamente." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
