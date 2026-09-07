using AuctionService.Application.DTOs;
using AuctionService.Application.Interfaces;
using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;

namespace AuctionService.Application.Services;

public class AuctionServiceImplementation : IAuctionService
{
    private readonly IAuctionRepository _auctionRepository;

    public AuctionServiceImplementation(IAuctionRepository auctionRepository)
    {
        _auctionRepository = auctionRepository;
    }

    public async Task<IEnumerable<AuctionDto>> GetAuctionsAsync(Guid? categoryId, AuctionStatus? status, string? search, decimal? minPrice, decimal? maxPrice, string? sortBy)
    {
        var auctions = await _auctionRepository.GetAllAsync(categoryId, status, search, minPrice, maxPrice, sortBy);
        return auctions.Select(MapToDto);
    }

    public async Task<AuctionDto?> GetAuctionByIdAsync(Guid id)
    {
        var auction = await _auctionRepository.GetByIdWithBidsAsync(id);
        return auction == null ? null : MapToDto(auction);
    }

    public async Task<AuctionDto> CreateAuctionAsync(CreateAuctionDto createDto)
    {
        if (createDto.EndDate <= createDto.StartDate)
        {
            throw new ArgumentException("La fecha de finalización debe ser posterior a la fecha de inicio.");
        }

        var category = await _auctionRepository.GetCategoryByIdAsync(createDto.CategoryId);
        if (category == null)
        {
            throw new ArgumentException("La categoría especificada no existe.");
        }

        var auction = new Auction
        {
            Id = Guid.NewGuid(),
            Title = createDto.Title.Trim(),
            Description = createDto.Description.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(createDto.ImageUrl) ? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" : createDto.ImageUrl.Trim(),
            CategoryId = createDto.CategoryId,
            Category = category,
            StartingPrice = createDto.StartingPrice,
            CurrentPrice = createDto.StartingPrice,
            MinimumIncrement = createDto.MinimumIncrement,
            SellerId = createDto.SellerId,
            StartDate = createDto.StartDate.ToUniversalTime(),
            EndDate = createDto.EndDate.ToUniversalTime(),
            Status = createDto.StartDate <= DateTime.UtcNow ? AuctionStatus.Active : AuctionStatus.Upcoming,
            CreatedAt = DateTime.UtcNow,
            BidCount = 0
        };

        await _auctionRepository.AddAsync(auction);
        
        await _auctionRepository.AddAuditLogAsync(new AuditLog
        {
            EventType = "AUCTION_CREATED",
            EntityId = auction.Id,
            EntityName = nameof(Auction),
            UserId = auction.SellerId,
            Details = $"Subasta '{auction.Title}' creada exitosamente con precio base ${auction.StartingPrice:N2}.",
            Timestamp = DateTime.UtcNow
        });

        await _auctionRepository.SaveChangesAsync();

        return MapToDto(auction);
    }

    public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
    {
        var categories = await _auctionRepository.GetCategoriesAsync();
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Icon = c.Icon
        });
    }

    private static AuctionDto MapToDto(Auction auction)
    {
        return new AuctionDto
        {
            Id = auction.Id,
            Title = auction.Title,
            Description = auction.Description,
            ImageUrl = auction.ImageUrl,
            CategoryId = auction.CategoryId,
            CategoryName = auction.Category?.Name ?? "General",
            StartingPrice = auction.StartingPrice,
            CurrentPrice = auction.CurrentPrice,
            MinimumIncrement = auction.MinimumIncrement,
            SellerId = auction.SellerId,
            WinnerId = auction.WinnerId,
            StartDate = auction.StartDate,
            EndDate = auction.EndDate,
            ExtendedUntil = auction.ExtendedUntil,
            Status = auction.Status.ToString(),
            BidCount = auction.BidCount,
            CreatedAt = auction.CreatedAt,
            RowVersion = auction.RowVersion
        };
    }
}
