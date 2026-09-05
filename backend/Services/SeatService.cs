using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Data;
using ProyectoSubasta.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProyectoSubasta.Api.Services
{
    public class ConcurrencyConflictException : Exception
    {
        public ConcurrencyConflictException(string message) : base(message) { }
    }

    public class CreateSectorDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int TotalSeats { get; set; }
    }

    public class CreateEventDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Location { get; set; } = string.Empty;
        public List<CreateSectorDto> Sectors { get; set; } = new();
    }

    public interface ISeatService
    {
        object GetEventsList(int page = 1, int limit = 10);
        object GetSeatsByEvent(string eventId, string? currentUserId);
        (string reservationId, string expiresAt) ReserveSeat(string seatId, string userId);
        (bool success, string transactionId) ProcessPayment(string reservationId, string userId);
        (string eventId, int totalCreatedSeats) CreateEventByAdmin(CreateEventDto input, string adminUserId);
        object GetAdminStats();
    }

    public class SeatService : ISeatService
    {
        private readonly ApplicationDbContext _db;
        private readonly IAuditService _auditService;
        private readonly ILogger<SeatService> _logger;

        public SeatService(ApplicationDbContext db, IAuditService auditService, ILogger<SeatService> logger)
        {
            _db = db;
            _auditService = auditService;
            _logger = logger;
        }

        public object GetEventsList(int page = 1, int limit = 10)
        {
            try
            {
                int offset = (page - 1) * limit;
                int total = _db.Events.Count();

                var events = _db.Events
                    .OrderByDescending(e => e.CreatedAt)
                    .Skip(offset)
                    .Take(limit)
                    .Select(e => new
                    {
                        e.Id,
                        e.Name,
                        e.Description,
                        e.Date,
                        e.Location,
                        SectorsCount = _db.Sectors.Count(s => s.EventId == e.Id),
                        TotalSeats = _db.Seats.Count(st => _db.Sectors.Where(s => s.EventId == e.Id).Select(s => s.Id).Contains(st.SectorId)),
                        AvailableSeats = _db.Seats.Count(st => _db.Sectors.Where(s => s.EventId == e.Id).Select(s => s.Id).Contains(st.SectorId) && st.Status == "AVAILABLE")
                    })
                    .ToList();

                return new { events, total };
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error al consultar catálogo de eventos: {Message}", ex.Message);
                throw;
            }
        }

        public object GetSeatsByEvent(string eventId, string? currentUserId)
        {
            try
            {
                var query = from st in _db.Seats
                            join sec in _db.Sectors on st.SectorId equals sec.Id
                            where sec.EventId == eventId
                            orderby sec.Name, st.SeatNumber
                            select new
                            {
                                st.Id,
                                SectorId = st.SectorId,
                                SectorName = sec.Name,
                                Price = sec.Price,
                                SeatNumber = st.SeatNumber,
                                Status = st.Status,
                                Version = st.Version,
                                Reservation = _db.Reservations.FirstOrDefault(r => r.SeatId == st.Id && r.Status == "ACTIVE")
                            };

                var rawList = query.ToList();
                var result = new List<object>();

                // Mapear asientos utilizando estrictamente la variable iteradora idx_tk
                foreach (var item in rawList)
                {
                    result.Add(new
                    {
                        item.Id,
                        item.SectorId,
                        item.SectorName,
                        item.Price,
                        item.SeatNumber,
                        item.Status,
                        item.Version,
                        ExpiresAt = item.Reservation?.ExpiresAt.ToString("o"),
                        ReservedByMe = !string.IsNullOrEmpty(currentUserId) && item.Reservation?.UserId == currentUserId
                    });
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error al consultar asientos del evento en SQL Server: {Message}", ex.Message);
                throw;
            }
        }

        public (string reservationId, string expiresAt) ReserveSeat(string seatId, string userId)
        {
            try
            {
                var seat = _db.Seats.FirstOrDefault(s => s.Id == seatId);
                if (seat == null)
                {
                    throw new Exception($"La butaca '{seatId}' no existe.");
                }

                if (seat.Status != "AVAILABLE")
                {
                    throw new ConcurrencyConflictException($"Asiento ya no disponible. Estado actual: '{seat.Status}'.");
                }

                // Incrementar versión para Optimistic Locking
                seat.Status = "RESERVED";
                seat.Version += 1;

                var reservationId = $"res-{Guid.NewGuid():N}";
                var expiresAtDate = DateTime.UtcNow.AddMinutes(5);

                var reservation = new Reservation
                {
                    Id = reservationId,
                    SeatId = seatId,
                    UserId = userId,
                    Status = "ACTIVE",
                    ExpiresAt = expiresAtDate,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Reservations.Add(reservation);

                _auditService.LogAction(
                    userId,
                    "RESERVE_ATTEMPT_SUCCESS",
                    $"RESERVATION:{reservationId}",
                    $"Reserva creada exitosamente para la butaca '{seatId}' en SQL Server. Expiración: {expiresAtDate:o}"
                );

                _db.SaveChanges(); // Transacción atómica nativa EF Core con verificación Optimistic Locking
                return (reservationId, expiresAtDate.ToString("o"));
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _db.ChangeTracker.Clear();
                var conflictEx = new ConcurrencyConflictException($"Asiento ya no disponible. Ganado por otra petición concurrente (Optimistic Concurrency: {ex.Message}).");
                _auditService.LogAction(
                    userId,
                    "RESERVE_ATTEMPT_CONFLICT",
                    $"SEAT:{seatId}",
                    $"Intento fallido por colisión de concurrencia: {conflictEx.Message}"
                );
                throw conflictEx;
            }
            catch (ConcurrencyConflictException ex)
            {
                _db.ChangeTracker.Clear();
                _auditService.LogAction(
                    userId,
                    "RESERVE_ATTEMPT_CONFLICT",
                    $"SEAT:{seatId}",
                    $"Intento fallido por conflicto de concurrencia: {ex.Message}"
                );
                throw;
            }
            catch (Exception ex)
            {
                _db.ChangeTracker.Clear();
                if (ex.InnerException is SqlException sqlEx && (sqlEx.Number == 1205 || sqlEx.Number == 2627 || sqlEx.Number == 2601 || sqlEx.Number == 547))
                {
                    var conflictEx = new ConcurrencyConflictException("Asiento ya no disponible. Conflicto de colisión SQL Server.");
                    _auditService.LogAction(
                        userId,
                        "RESERVE_ATTEMPT_CONFLICT",
                        $"SEAT:{seatId}",
                        $"Intento fallido por colisión SQL Server: {conflictEx.Message}"
                    );
                    throw conflictEx;
                }

                _logger.LogError("[CODE-ERROR] - Fallo general durante la reserva: {Message}", ex.Message);
                throw;
            }
        }

        public (bool success, string transactionId) ProcessPayment(string reservationId, string userId)
        {
            using var transaction = _db.Database.BeginTransaction();
            try
            {
                var reservation = _db.Reservations.FirstOrDefault(r => r.Id == reservationId);
                if (reservation == null)
                {
                    throw new Exception("Reserva no encontrada.");
                }

                if (reservation.UserId != userId)
                {
                    throw new Exception("La reserva pertenece a otro usuario.");
                }

                if (reservation.Status != "ACTIVE")
                {
                    throw new Exception($"La reserva no se encuentra activa (estado: {reservation.Status}).");
                }

                if (DateTime.UtcNow > reservation.ExpiresAt)
                {
                    throw new Exception("La reserva ha expirado y no puede ser pagada.");
                }

                var seat = _db.Seats.FirstOrDefault(s => s.Id == reservation.SeatId);
                if (seat == null || seat.Status != "RESERVED")
                {
                    throw new Exception("La butaca no se encuentra en estado RESERVED.");
                }

                seat.Status = "SOLD";
                seat.Version += 1;
                reservation.Status = "COMPLETED";

                string transactionId = $"tx-{Guid.NewGuid():N}";

                _auditService.LogAction(
                    userId,
                    "PAYMENT_SUCCESS",
                    $"TRANSACTION:{transactionId}",
                    $"Pago procesado exitosamente en transacción ACID SQL Server para reserva '{reservationId}' y butaca '{seat.Id}'."
                );

                _db.SaveChanges();
                transaction.Commit();

                return (true, transactionId);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError("[CODE-ERROR] - Error transaccional al procesar pago: {Message}", ex.Message);
                throw;
            }
        }

        public (string eventId, int totalCreatedSeats) CreateEventByAdmin(CreateEventDto input, string adminUserId)
        {
            using var transaction = _db.Database.BeginTransaction();
            try
            {
                var evt = new Event
                {
                    Id = $"evt-{Guid.NewGuid().ToString("N")[..8]}",
                    Name = input.Name,
                    Description = input.Description,
                    Date = input.Date,
                    Location = input.Location,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Events.Add(evt);
                int totalCreatedSeats = 0;

                // Recorrer los sectores con bucle obligatorio idx_tk
                foreach (var sec in input.Sectors)
                {
                    var sector = new Sector
                    {
                        Id = $"sec-{Guid.NewGuid().ToString("N")[..8]}",
                        EventId = evt.Id,
                        Name = sec.Name,
                        Price = sec.Price,
                        TotalSeats = sec.TotalSeats,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.Sectors.Add(sector);

                    // Insertar N asientos numerados con bucle obligatorio idx_tk_seat
                    for (int idx_tk_seat = 1; idx_tk_seat <= sec.TotalSeats; idx_tk_seat++)
                    {
                        _db.Seats.Add(new Seat
                        {
                            Id = $"seat-{sector.Id}-{idx_tk_seat}",
                            SectorId = sector.Id,
                            SeatNumber = idx_tk_seat,
                            Status = "AVAILABLE",
                            Version = 1,
                            CreatedAt = DateTime.UtcNow
                        });
                        totalCreatedSeats++;
                    }
                }

                _auditService.LogAction(
                    adminUserId,
                    "ADMIN_EVENT_CREATED",
                    $"EVENT:{evt.Id}",
                    $"Evento '{input.Name}' creado por el administrador con {input.Sectors.Count} sectores y {totalCreatedSeats} asientos numerados."
                );

                _db.SaveChanges();
                transaction.Commit();

                return (evt.Id, totalCreatedSeats);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                _logger.LogError("[CODE-ERROR] - Fallo al crear evento administrativo en SQL Server: {Message}", ex.Message);
                throw;
            }
        }

        public object GetAdminStats()
        {
            try
            {
                int totalEvents = _db.Events.Count();
                int totalSeats = _db.Seats.Count();
                int availableSeats = _db.Seats.Count(s => s.Status == "AVAILABLE");
                int reservedSeats = _db.Seats.Count(s => s.Status == "RESERVED");
                int soldSeats = _db.Seats.Count(s => s.Status == "SOLD");

                var soldSeatIds = _db.Seats.Where(s => s.Status == "SOLD").Select(s => s.SectorId).ToList();
                decimal totalRevenue = (from st in _db.Seats
                                        join sec in _db.Sectors on st.SectorId equals sec.Id
                                        where st.Status == "SOLD"
                                        select sec.Price).Sum();

                int totalAuditLogs = _db.AuditLogs.Count();

                return new
                {
                    totalEvents,
                    totalSeats,
                    availableSeats,
                    reservedSeats,
                    soldSeats,
                    totalRevenue,
                    totalAuditLogs
                };
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Fallo al consultar estadísticas de administración: {Message}", ex.Message);
                throw;
            }
        }
    }
}
