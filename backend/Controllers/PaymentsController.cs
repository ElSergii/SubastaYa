using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Services;
using System;

namespace ProyectoSubasta.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly ISeatService _seatService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(ISeatService seatService, ILogger<PaymentsController> logger)
        {
            _seatService = seatService;
            _logger = logger;
        }

        public class PaymentRequestDto
        {
            public string ReservationId { get; set; } = string.Empty;
            public string? UserId { get; set; }
        }

        [HttpPost]
        public IActionResult ProcessPayment([FromBody] PaymentRequestDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.ReservationId))
                {
                    return BadRequest(new { success = false, error = "El parámetro reservationId es obligatorio." });
                }

                string userId = dto.UserId ?? string.Empty;
                if (string.IsNullOrWhiteSpace(userId) && Request.Headers.TryGetValue("x-user-id", out var headerVal))
                {
                    userId = headerVal.ToString();
                }
                if (string.IsNullOrWhiteSpace(userId))
                {
                    userId = "USER_DEFAULT";
                }

                var (success, transactionId) = _seatService.ProcessPayment(dto.ReservationId, userId);

                return Ok(new
                {
                    success = true,
                    message = "Pago procesado con éxito en transacción ACID SQL Server. Entradas vendidas.",
                    transactionId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error en POST /api/v1/payments: {Message}", ex.Message);
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }
}
