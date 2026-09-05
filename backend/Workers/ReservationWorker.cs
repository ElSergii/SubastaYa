using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Data;
using ProyectoSubasta.Api.Services;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ProyectoSubasta.Api.Workers
{
    public class ReservationWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReservationWorker> _logger;

        public ReservationWorker(IServiceProvider serviceProvider, ILogger<ReservationWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("⏱️ [WORKER STARTED] Proceso C# en segundo plano iniciado (verificación de liberaciones cada 5s).");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    ReleaseExpiredReservations();
                }
                catch (Exception ex)
                {
                    _logger.LogError("[CODE-ERROR] - Fallo en el worker de liberación automática: {Message}", ex.Message);
                }

                await Task.Delay(5000, stoppingToken);
            }
        }

        public int ReleaseExpiredReservations()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var audit = scope.ServiceProvider.GetRequiredService<IAuditService>();

            var strategy = db.Database.CreateExecutionStrategy();
            return strategy.Execute(() =>
            {
                var now = DateTime.UtcNow;
                var expiredReservations = db.Reservations
                    .Where(r => r.Status == "ACTIVE" && r.ExpiresAt <= now)
                    .ToList();

                int releasedCount = 0;

                // Recorrer las reservas vencidas utilizando estrictamente el nombre de variable idx_tk
                foreach (var item in expiredReservations)
                {
                    using var tx = db.Database.BeginTransaction();
                    try
                    {
                        item.Status = "EXPIRED";

                        var seat = db.Seats.FirstOrDefault(s => s.Id == item.SeatId);
                        if (seat != null && seat.Status == "RESERVED")
                        {
                            seat.Status = "AVAILABLE";
                            seat.Version += 1;
                        }

                        audit.LogAction(
                            "BACKGROUND_WORKER",
                            "AUTO_RELEASE_EXPIRED",
                            $"SEAT:{item.SeatId}",
                            $"Reserva '{item.Id}' de usuario '{item.UserId}' vencida (expiraba en {item.ExpiresAt:o}). Butaca devuelta a estado AVAILABLE."
                        );

                        db.SaveChanges();
                        tx.Commit();
                        releasedCount++;
                    }
                    catch (Exception ex)
                    {
                        tx.Rollback();
                        _logger.LogError("[CODE-ERROR] - Fallo al liberar la reserva vencida '{Id}': {Message}", item.Id, ex.Message);
                    }
                }

                if (releasedCount > 0)
                {
                    _logger.LogInformation("[WORKER] - Se liberaron automáticamente {Count} reservas vencidas en SQL Server.", releasedCount);
                }

                return releasedCount;
            });
        }
    }
}
