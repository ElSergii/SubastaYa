using AuctionService.Application.DTOs;
using AuctionService.Application.Interfaces;
using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Application.Services;

public class BidServiceImplementation : IBidService
{
    private readonly IAuctionRepository _auctionRepository;

    public BidServiceImplementation(IAuctionRepository auctionRepository)
    {
        _auctionRepository = auctionRepository;
    }

    public async Task<BidResultDto> PlaceBidAsync(CreateBidDto bidDto)
    {
        var auction = await _auctionRepository.GetByIdWithBidsAsync(bidDto.AuctionId);
        if (auction == null)
        {
            throw new KeyNotFoundException($"No se encontró la subasta con ID {bidDto.AuctionId}.");
        }

        var effectiveEndDate = auction.ExtendedUntil ?? auction.EndDate;
        var now = DateTime.UtcNow;

        if (auction.Status != AuctionStatus.Active || now > effectiveEndDate)
        {
            await _auctionRepository.AddAuditLogAsync(new AuditLog
            {
                EventType = "BID_REJECTED_EXPIRED",
                EntityId = auction.Id,
                EntityName = nameof(Auction),
                UserId = bidDto.UserId,
                Details = $"Intento de puja de ${bidDto.Amount:N2} rechazado: la subasta no está activa o ya finalizó.",
                Timestamp = now
            });
            await _auctionRepository.SaveChangesAsync();

            throw new InvalidOperationException("La subasta no se encuentra activa para recibir pujas.");
        }

        if (auction.SellerId == bidDto.UserId)
        {
            throw new InvalidOperationException("El vendedor no puede pujar en su propia subasta.");
        }

        var minRequired = auction.CurrentPrice + auction.MinimumIncrement;
        if (bidDto.Amount < minRequired)
        {
            await _auctionRepository.AddAuditLogAsync(new AuditLog
            {
                EventType = "BID_REJECTED_LOW_AMOUNT",
                EntityId = auction.Id,
                EntityName = nameof(Auction),
                UserId = bidDto.UserId,
                Details = $"Intento de puja de ${bidDto.Amount:N2} rechazado: el monto mínimo requerido era ${minRequired:N2}.",
                Timestamp = now
            });
            await _auctionRepository.SaveChangesAsync();

            throw new InvalidOperationException($"El monto ofertado (${bidDto.Amount:N2}) debe ser al menos ${minRequired:N2}.");
        }

        // Si se envió RowVersion previo para comprobación explícita
        if (bidDto.ExpectedRowVersion != null && bidDto.ExpectedRowVersion.Length > 0)
        {
            if (!auction.RowVersion.SequenceEqual(bidDto.ExpectedRowVersion))
            {
                await _auctionRepository.AddAuditLogAsync(new AuditLog
                {
                    EventType = "CONCURRENCY_BID_REJECTED",
                    EntityId = auction.Id,
                    EntityName = nameof(Auction),
                    UserId = bidDto.UserId,
                    Details = $"Intento de puja rechazado por conflicto de concurrencia optimista (RowVersion desactualizado).",
                    Timestamp = now
                });
                await _auctionRepository.SaveChangesAsync();

                throw new DbUpdateConcurrencyException("La subasta ha sido modificada por otra transacción previa.");
            }
        }

        // Regla Anti-Sniping: si la puja ocurre en los últimos 60 segundos
        bool antiSnipingTriggered = false;
        var remainingTime = effectiveEndDate - now;
        if (remainingTime > TimeSpan.Zero && remainingTime <= TimeSpan.FromSeconds(60))
        {
            effectiveEndDate = effectiveEndDate.AddMinutes(2);
            auction.ExtendedUntil = effectiveEndDate;
            antiSnipingTriggered = true;

            await _auctionRepository.AddAuditLogAsync(new AuditLog
            {
                EventType = "ANTI_SNIPING_EXTENDED",
                EntityId = auction.Id,
                EntityName = nameof(Auction),
                UserId = bidDto.UserId,
                Details = $"Anti-Sniping activado: Subasta extendida por 2 minutos hasta {effectiveEndDate:HH:mm:ss} UTC.",
                Timestamp = now
            });
        }

        // Desmarcar ganadores previos
        foreach (var existingBid in auction.Bids.Where(b => b.IsWinningBid))
        {
            existingBid.IsWinningBid = false;
        }

        var newBid = new Bid
        {
            Id = Guid.NewGuid(),
            AuctionId = auction.Id,
            UserId = bidDto.UserId,
            Amount = bidDto.Amount,
            BidTime = now,
            IsWinningBid = true
        };

        auction.CurrentPrice = bidDto.Amount;
        auction.WinnerId = bidDto.UserId;
        auction.BidCount++;

        await _auctionRepository.AddBidAsync(newBid);
        await _auctionRepository.UpdateAsync(auction);

        await _auctionRepository.AddAuditLogAsync(new AuditLog
        {
            EventType = "BID_ACCEPTED",
            EntityId = auction.Id,
            EntityName = nameof(Auction),
            UserId = bidDto.UserId,
            Details = $"Puja aceptada por ${bidDto.Amount:N2}. Nuevo líder: {bidDto.UserId}.",
            Timestamp = now
        });

        try
        {
            await _auctionRepository.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Registrar conflicto en auditoría
            await _auctionRepository.AddAuditLogAsync(new AuditLog
            {
                EventType = "CONCURRENCY_BID_REJECTED",
                EntityId = auction.Id,
                EntityName = nameof(Auction),
                UserId = bidDto.UserId,
                Details = $"Conflicto de concurrencia al intentar guardar la puja por ${bidDto.Amount:N2}: {ex.Message}",
                Timestamp = DateTime.UtcNow
            });
            await _auctionRepository.SaveChangesAsync();

            throw; // Se capturará en el controller para devolver HTTP 409 Conflict
        }

        return new BidResultDto
        {
            Success = true,
            Message = antiSnipingTriggered ? "¡Oferta aceptada! Se activó Anti-Sniping (+2 min de extensión)." : "¡Oferta aceptada! Eres el postor líder.",
            CurrentPrice = auction.CurrentPrice,
            LeadingUserId = auction.WinnerId,
            EffectiveEndDate = effectiveEndDate,
            AntiSnipingExtended = antiSnipingTriggered,
            Bid = new BidDto
            {
                Id = newBid.Id,
                AuctionId = newBid.AuctionId,
                UserId = newBid.UserId,
                Amount = newBid.Amount,
                BidTime = newBid.BidTime,
                IsWinningBid = newBid.IsWinningBid
            }
        };
    }

    public async Task<IEnumerable<BidDto>> GetBidsForAuctionAsync(Guid auctionId)
    {
        var bids = await _auctionRepository.GetBidsByAuctionIdAsync(auctionId);
        return bids.Select(b => new BidDto
        {
            Id = b.Id,
            AuctionId = b.AuctionId,
            UserId = b.UserId,
            Amount = b.Amount,
            BidTime = b.BidTime,
            IsWinningBid = b.IsWinningBid
        });
    }
}
