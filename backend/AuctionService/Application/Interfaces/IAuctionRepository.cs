using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;

namespace AuctionService.Application.Interfaces;

public interface IAuctionRepository
{
    Task<IEnumerable<Auction>> GetAllAsync(Guid? categoryId, AuctionStatus? status, string? search, decimal? minPrice, decimal? maxPrice, string? sortBy);
    Task<Auction?> GetByIdAsync(Guid id);
    Task<Auction?> GetByIdWithBidsAsync(Guid id);
    Task AddAsync(Auction auction);
    Task UpdateAsync(Auction auction);
    Task DeleteAsync(Auction auction);
    Task SaveChangesAsync();
    
    Task<IEnumerable<Category>> GetCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(Guid id);

    Task AddBidAsync(Bid bid);
    Task<IEnumerable<Bid>> GetBidsByAuctionIdAsync(Guid auctionId);
    Task AddAuditLogAsync(AuditLog auditLog);
}
