using GroceryStore.Application.Interfaces;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly GroceryDbContext _ctx;
        public CartRepository(GroceryDbContext ctx) => _ctx = ctx;

        public async Task<Cart> GetOrCreateForUserAsync(string userId)
        {
            var cart = await _ctx.Carts.Include(c => c.Items).ThenInclude(i => i.Product)
                                       .FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                await _ctx.Carts.AddAsync(cart);
                await _ctx.SaveChangesAsync();
            }
            return cart;
        }

        public Task<Cart?> GetForUserAsync(string userId) =>
            _ctx.Carts.Include(c => c.Items).ThenInclude(i => i.Product)
                      .FirstOrDefaultAsync(c => c.UserId == userId);

        public async Task AddItemAsync(string userId, int productId, int quantity)
        {
            var cart = await GetOrCreateForUserAsync(userId);

            var existing = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (existing == null)
                cart.Items.Add(new CartItem { ProductId = productId, Quantity = quantity });
            else
                existing.Quantity += quantity;
        }

        public async Task UpdateItemQuantityAsync(string userId, int cartItemId, int quantity)
        {
            var cart = await GetForUserAsync(userId);
            var item = cart?.Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item != null) item.Quantity = quantity;
        }

        public async Task RemoveItemAsync(string userId, int cartItemId)
        {
            var cart = await GetForUserAsync(userId);
            var item = cart?.Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item != null) _ctx.CartItems.Remove(item);
        }

        public async Task ClearAsync(string userId)
        {
            var cart = await GetForUserAsync(userId);
            if (cart != null) _ctx.CartItems.RemoveRange(cart.Items);
        }

        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
