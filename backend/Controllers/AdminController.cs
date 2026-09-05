using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Data;
using ProyectoSubasta.Api.Services;
using System;

namespace ProyectoSubasta.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ISeatService _seatService;
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AdminController> _logger;

        public AdminController(ISeatService seatService, ApplicationDbContext db, ILogger<AdminController> logger)
        {
            _seatService = seatService;
            _db = db;
            _logger = logger;
        }

        [HttpGet("stats")]
        public IActionResult GetAdminStats()
        {
            try
            {
                var stats = _seatService.GetAdminStats();
                return Ok(new { success = true, stats });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en GET /api/v1/admin/stats: {Message}", ex.Message);
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("reset-database")]
        public IActionResult ResetDatabase()
        {
            try
            {
                _db.AuditLogs.RemoveRange(_db.AuditLogs);
                _db.Reservations.RemoveRange(_db.Reservations);
                _db.Seats.RemoveRange(_db.Seats);
                _db.Sectors.RemoveRange(_db.Sectors);
                _db.Events.RemoveRange(_db.Events);
                _db.SaveChanges();

                _db.SeedDatabase();

                return Ok(new { success = true, message = "Base de datos SQL Server restablecida con éxito." });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error al reiniciar la base de datos: {Message}", ex.Message);
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }
}
