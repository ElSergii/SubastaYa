using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Services;
using System;

namespace ProyectoSubasta.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly ISeatService _seatService;
        private readonly ILogger<EventsController> _logger;

        public EventsController(ISeatService seatService, ILogger<EventsController> logger)
        {
            _seatService = seatService;
            _logger = logger;
        }

        private string ExtractUserId(string fallback = "USER_DEFAULT")
        {
            if (Request.Headers.TryGetValue("x-user-id", out var headerVal) && !string.IsNullOrWhiteSpace(headerVal))
            {
                return headerVal.ToString();
            }
            return fallback;
        }

        /// <summary>
        /// Listado paginado del catálogo de eventos
        /// </summary>
        [HttpGet]
        public IActionResult GetEvents([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                var result = _seatService.GetEventsList(page, limit);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en GET /api/v1/events: {Message}", ex.Message);
                return StatusCode(500, new { success = false, error = "Error interno del servidor al consultar eventos." });
            }
        }

        /// <summary>
        /// ADMIN: Crear un nuevo evento con sectores y asientos numerados
        /// </summary>
        [HttpPost]
        public IActionResult CreateEvent([FromBody] CreateEventDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || dto.Sectors == null || dto.Sectors.Count == 0)
                {
                    return BadRequest(new { success = false, error = "Debe proporcionar Name, Date, Location y al menos 1 Sector." });
                }

                string adminUserId = ExtractUserId("ADMIN_ROOT");
                var (eventId, totalCreatedSeats) = _seatService.CreateEventByAdmin(dto, adminUserId);

                return Created(string.Empty, new
                {
                    success = true,
                    message = $"Evento '{dto.Name}' creado exitosamente con {totalCreatedSeats} asientos numerados.",
                    eventId,
                    totalSeats = totalCreatedSeats
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en POST /api/v1/events: {Message}", ex.Message);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// Estado actual de todas las butacas de un evento
        /// </summary>
        [HttpGet("{eventId}/seats")]
        public IActionResult GetSeats(string eventId)
        {
            try
            {
                string userId = ExtractUserId("GUEST_USER");
                var seats = _seatService.GetSeatsByEvent(eventId, userId);
                return Ok(new { success = true, eventId, seats });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en GET /api/v1/events/{EventId}/seats: {Message}", eventId, ex.Message);
                return StatusCode(500, new { success = false, error = "Error al obtener el mapa de asientos." });
            }
        }

        /// <summary>
        /// Intento de reserva temporal con control de concurrencia (Optimistic Locking)
        /// </summary>
        [HttpPost("{eventId}/seats/{seatId}/reserve")]
        public IActionResult ReserveSeat(string eventId, string seatId, [FromBody] UserRequestDto? body)
        {
            try
            {
                string userId = body?.UserId ?? ExtractUserId("USER_DEFAULT");
                var (reservationId, expiresAt) = _seatService.ReserveSeat(seatId, userId);

                return Created(string.Empty, new
                {
                    success = true,
                    message = "Butaca reservada temporalmente por 5 minutos.",
                    reservationId,
                    expiresAt
                });
            }
            catch (ConcurrencyConflictException ex)
            {
                return StatusCode(409, new
                {
                    success = false,
                    error = ex.Message,
                    code = "CONCURRENCY_CONFLICT"
                });
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return StatusCode(409, new
                {
                    success = false,
                    error = "Asiento ya no disponible. Ganado por otra petición concurrente (Optimistic Concurrency).",
                    code = "CONCURRENCY_CONFLICT"
                });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(409, new
                {
                    success = false,
                    error = "Asiento ya no disponible. Conflicto de colisión SQL Server.",
                    code = "CONCURRENCY_CONFLICT"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en POST reserve: {Message}", ex.Message);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }

    public class UserRequestDto
    {
        public string? UserId { get; set; }
    }
}
