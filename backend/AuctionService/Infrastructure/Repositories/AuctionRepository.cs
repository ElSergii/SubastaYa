using AuctionService.Application.Interfaces;
using AuctionService.Domain.Entities;
using AuctionService.Domain.Enums;
using AuctionService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Infrastructure.Repositories;

public class AuctionRepository : IAuctionRepository
{
    private readonly AuctionDbContext _context;

    public AuctionRepository(AuctionDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Auction>> GetAllAsync(Guid? categoryId, AuctionStatus? status, string? search, decimal? minPrice, decimal? maxPrice, string? sortBy)
    {
        var query = _context.Auctions
            .Include(a => a.Category)
            .AsNoTracking();

        if (categoryId.HasValue)
        {
            query = query.Where(a => a.CategoryId == categoryId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(a => a.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(a => a.Title.ToLower().Contains(searchLower) || a.Description.ToLower().Contains(searchLower));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(a => a.CurrentPrice >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(a => a.CurrentPrice <= maxPrice.Value);
        }

        query = sortBy?.ToLower() switch
        {
            "price_asc" => query.OrderBy(a => a.CurrentPrice),
            "price_desc" => query.OrderByDescending(a => a.CurrentPrice),
            "ending_soon" => query.OrderBy(a => a.EndDate),
            "newest" => query.OrderByDescending(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt)
        };

        return await query.ToListAsync();
    }

    public async Task<Auction?> GetByIdAsync(Guid id)
    {
        return await _context.Auctions
            .Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Auction?> GetByIdWithBidsAsync(Guid id)
    {
        return await _context.Auctions
            .Include(a => a.Category)
            .Include(a => a.Bids.OrderByDescending(b => b.BidTime))
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task AddAsync(Auction auction)
    {
        await _context.Auctions.AddAsync(auction);
    }

    public Task UpdateAsync(Auction auction)
    {
        _context.Auctions.Update(auction);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Category>> GetCategoriesAsync()
    {
        return await _context.Categories.AsNoTracking().ToListAsync();
    }

    public async Task<Category?> GetCategoryByIdAsync(Guid id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task AddBidAsync(Bid bid)
    {
        await _context.Bids.AddAsync(bid);
    }

    public async Task<IEnumerable<Bid>> GetBidsByAuctionIdAsync(Guid auctionId)
    {
        return await _context.Bids
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.BidTime)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task AddAuditLogAsync(AuditLog auditLog)
    {
        await _context.AuditLogs.AddAsync(auditLog);
    }
}
