using AuctionService.Application.DTOs;

namespace AuctionService.Application.Interfaces;

public interface IBidService
{
    Task<BidResultDto> PlaceBidAsync(CreateBidDto bidDto);
    Task<IEnumerable<BidDto>> GetBidsForAuctionAsync(Guid auctionId);
}
