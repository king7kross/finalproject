// ICartRepository.cs
// small interface to manage a user's shopping cart

using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart> GetOrCreateForUserAsync(string userId);           // get cart or make a new one
        Task<Cart?> GetForUserAsync(string userId);                  // read existing cart (no create)
        Task AddItemAsync(string userId, int productId, int quantity); // add a product to cart
        Task UpdateItemQuantityAsync(string userId, int cartItemId, int quantity); // change item qty
        Task RemoveItemAsync(string userId, int cartItemId);         // delete one item
        Task ClearAsync(string userId);                              // empty the whole cart
        Task<bool> SaveChangesAsync();                               // persist changes
    }
}
