using AuctionService.Domain.Entities;
using AuctionService.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Controllers;

[ApiController]
[Route("api/v1/auctions/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly AuctionDbContext _context;

    public AuditLogsController(AuctionDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Consulta el historial inmutable de auditoría del sistema de subastas.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AuditLog>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.AuditLogs
            .AsNoTracking()
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }
}
