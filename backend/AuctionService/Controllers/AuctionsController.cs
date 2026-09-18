using AuctionService.Application.DTOs;
using AuctionService.Application.Interfaces;
using AuctionService.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Controllers;

[ApiController]
[Route("api/v1/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly IAuctionService _auctionService;
    private readonly IBidService _bidService;

    public AuctionsController(IAuctionService auctionService, IBidService bidService)
    {
        _auctionService = auctionService;
        _bidService = bidService;
    }

    /// <summary>
    /// Obtiene el catálogo de subastas con opciones de búsqueda, filtrado y ordenamiento.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AuctionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuctions(
        [FromQuery] Guid? categoryId,
        [FromQuery] AuctionStatus? status,
        [FromQuery] string? search,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy)
    {
        var result = await _auctionService.GetAuctionsAsync(categoryId, status, search, minPrice, maxPrice, sortBy);
        return Ok(result);
    }

    /// <summary>
    /// Obtiene los detalles de una subasta específica por su ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuctionById(Guid id)
    {
        var auction = await _auctionService.GetAuctionByIdAsync(id);
        if (auction == null)
        {
            return NotFound(new { error = $"No se encontró la subasta con ID {id}" });
        }
        return Ok(auction);
    }

    /// <summary>
    /// Crea una nueva subasta en la plataforma.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _auctionService.CreateAuctionAsync(createDto);
            return CreatedAtAction(nameof(GetAuctionById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina o cancela una subasta existente únicamente si no posee pujas registradas.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAuction(Guid id, [FromQuery] Guid userId)
    {
        try
        {
            await _auctionService.DeleteAuctionAsync(id, userId);
            return Ok(new { success = true, message = "Subasta cancelada exitosamente." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el historial de pujas de una subasta.
    /// </summary>
    [HttpGet("{id:guid}/bids")]
    [ProducesResponseType(typeof(IEnumerable<BidDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBids(Guid id)
    {
        var bids = await _bidService.GetBidsForAuctionAsync(id);
        return Ok(bids);
    }

    /// <summary>
    /// Realiza una nueva puja sobre una subasta activa.
    /// Maneja colisiones de concurrencia devueltas como HTTP 409 Conflict.
    /// </summary>
    [HttpPost("{id:guid}/bids")]
    [ProducesResponseType(typeof(BidResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> PlaceBid(Guid id, [FromBody] CreateBidDto bidDto)
    {
        if (id != bidDto.AuctionId)
        {
            return BadRequest(new { error = "El ID de la URL no coincide con el ID de la subasta en el cuerpo de la petición." });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _bidService.PlaceBidAsync(bidDto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (DbUpdateConcurrencyException)
        {
            // Conflictos de concurrencia devuelven HTTP 409 Conflict
            return StatusCode(StatusCodes.Status409Conflict, new
            {
                error = "Conflicto de concurrencia: Otro usuario realizó una puja sobre esta subasta simultáneamente.",
                code = "CONCURRENCY_CONFLICT"
            });
        }
    }
}
