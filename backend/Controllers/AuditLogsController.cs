using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Services;
using System;

namespace ProyectoSubasta.Api.Controllers
{
    [ApiController]
    [Route("api/v1/audit-logs")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditService _auditService;
        private readonly ILogger<AuditLogsController> _logger;

        public AuditLogsController(IAuditService auditService, ILogger<AuditLogsController> logger)
        {
            _auditService = auditService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetLogs([FromQuery] int limit = 100)
        {
            try
            {
                var logs = _auditService.GetLogs(limit);
                return Ok(new { success = true, logs });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en GET /api/v1/audit-logs: {Message}", ex.Message);
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }
}
