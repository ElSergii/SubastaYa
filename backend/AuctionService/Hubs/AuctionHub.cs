using Microsoft.AspNetCore.SignalR;

namespace AuctionService.Hubs;

// Hub de SignalR para la comunicación en tiempo real de salas de subasta.
public class AuctionHub : Hub
{
    // Permite a un cliente unirse al grupo de una sala de subasta específica por su ID.
    public async Task JoinAuctionGroup(string auctionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, auctionId);
    }

    // Permite a un cliente salir del grupo de la sala de subasta.
    public async Task LeaveAuctionGroup(string auctionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, auctionId);
    }
}
