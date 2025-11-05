using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart> GetOrCreateForUserAsync(string userId);
        Task<Cart?> GetForUserAsync(string userId);
        Task AddItemAsync(string userId, int productId, int quantity);
        Task UpdateItemQuantityAsync(string userId, int cartItemId, int quantity);
        Task RemoveItemAsync(string userId, int cartItemId);
        Task ClearAsync(string userId);
        Task<bool> SaveChangesAsync();
    }
}
