using Microsoft.Extensions.Logging;
using ProyectoSubasta.Api.Data;
using ProyectoSubasta.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProyectoSubasta.Api.Services
{
    public interface IAuditService
    {
        long LogAction(string userId, string action, string resource, string details);
        List<AuditLog> GetLogs(int limit = 100);
    }

    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AuditService> _logger;

        public AuditService(ApplicationDbContext db, ILogger<AuditService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public long LogAction(string userId, string action, string resource, string details)
        {
            try
            {
                long nowMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                var log = new AuditLog
                {
                    UserId = userId,
                    Action = action,
                    Resource = resource,
                    Details = details,
                    TimestampMs = nowMs,
                    CreatedAt = DateTime.UtcNow
                };

                _db.AuditLogs.Add(log);
                _db.SaveChanges();
                return log.Id;
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Fallo al guardar registro de auditoria en SQL Server: {Message}", ex.Message);
                throw;
            }
        }

        public List<AuditLog> GetLogs(int limit = 100)
        {
            try
            {
                return _db.AuditLogs
                    .OrderByDescending(a => a.Id)
                    .Take(limit)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Fallo al consultar registros de auditoria: {Message}", ex.Message);
                throw;
            }
        }
    }
}
