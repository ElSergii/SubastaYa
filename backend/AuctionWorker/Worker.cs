using System.Net.Http.Json;
using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;
using AuctionService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuctionWorker;

// Worker de fondo que busca periódicamente subastas vencidas para finalizar o declarar desiertas.
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly HttpClient _httpClient;

    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider, HttpClient httpClient)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _httpClient = httpClient;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("SubastaYa Worker de fondo iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpiredAuctionsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar subastas vencidas.");
            }

            // Ejecuta la verificación cada 10 segundos
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }

    private async Task ProcessExpiredAuctionsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AuctionDbContext>();

        var now = DateTime.UtcNow;

        // Buscar subastas activas cuyo tiempo de finalización haya caducado
        var expiredAuctions = await dbContext.Auctions
            .Where(a => a.Status == AuctionStatus.Active && (a.ExtendedUntil ?? a.EndDate) <= now)
            .ToListAsync();

        if (!expiredAuctions.Any()) return;

        foreach (var auction in expiredAuctions)
        {
            if (auction.WinnerId.HasValue && auction.BidCount > 0)
            {
                // Caso con ganador: finalizar subasta, registrar la venta y transferir fondos
                auction.Status = AuctionStatus.Finished;

                var sale = new Sale
                {
                    Id = Guid.NewGuid(),
                    AuctionId = auction.Id,
                    SellerId = auction.SellerId,
                    BuyerId = auction.WinnerId.Value,
                    FinalPrice = auction.CurrentPrice,
                    SaleDate = now
                };
                await dbContext.Sales.AddAsync(sale);

                // Transferencia atómica de Escrow del comprador al vendedor
                try
                {
                    var transferPayload = new
                    {
                        buyerUserId = auction.WinnerId.Value,
                        sellerUserId = auction.SellerId,
                        amount = auction.CurrentPrice,
                        auctionId = auction.Id
                    };
                    await _httpClient.PostAsJsonAsync("http://localhost:5002/api/v1/wallets/escrow/transfer", transferPayload);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudo invocar la transferencia de wallet para la subasta {AuctionId}", auction.Id);
                }

                await dbContext.AuditLogs.AddAsync(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = "AUCTION_FINISHED_WITH_WINNER",
                    EntityId = auction.Id,
                    EntityName = nameof(Auction),
                    UserId = auction.WinnerId.Value,
                    Details = $"Subasta '{auction.Title}' FINALIZADA. Ganador: {auction.WinnerId}. Precio final: ${auction.CurrentPrice:N2}.",
                    Timestamp = now
                });

                _logger.LogInformation("Subasta {AuctionId} finalizada con ganador {WinnerId}", auction.Id, auction.WinnerId);
            }
            else
            {
                // Caso sin ofertas: marcar como DESIERTA
                auction.Status = AuctionStatus.Deserted;

                await dbContext.AuditLogs.AddAsync(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    EventType = "AUCTION_DESERTED",
                    EntityId = auction.Id,
                    EntityName = nameof(Auction),
                    Details = $"Subasta '{auction.Title}' declarada DESIERTA por no recibir ofertas.",
                    Timestamp = now
                });

                _logger.LogInformation("Subasta {AuctionId} marcada como DESIERTA", auction.Id);
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
