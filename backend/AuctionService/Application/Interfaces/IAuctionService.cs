using AuctionService.Application.DTOs;
using AuctionService.Domain.Enums;

namespace AuctionService.Application.Interfaces;

public interface IAuctionService
{
    Task<IEnumerable<AuctionDto>> GetAuctionsAsync(Guid? categoryId, AuctionStatus? status, string? search, decimal? minPrice, decimal? maxPrice, string? sortBy);
    Task<AuctionDto?> GetAuctionByIdAsync(Guid id);
    Task<AuctionDto> CreateAuctionAsync(CreateAuctionDto createDto);
    Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
}
