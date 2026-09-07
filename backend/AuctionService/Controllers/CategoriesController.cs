using AuctionService.Application.DTOs;
using AuctionService.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AuctionService.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IAuctionService _auctionService;

    public CategoriesController(IAuctionService auctionService)
    {
        _auctionService = auctionService;
    }

    /// <summary>
    /// Obtiene todas las categorías disponibles en la plataforma.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _auctionService.GetCategoriesAsync();
        return Ok(categories);
    }
}
