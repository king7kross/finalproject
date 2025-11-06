using GroceryStore.Application.Interfaces;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    // CartRepository: handles CRUD for a user's cart using EF Core
    public class CartRepository : ICartRepository
    {
        private readonly GroceryDbContext _ctx;
        public CartRepository(GroceryDbContext ctx) => _ctx = ctx;

        // get the user's cart; create one if it doesn't exist yet
        public async Task<Cart> GetOrCreateForUserAsync(string userId)
        {
            var cart = await _ctx.Carts
                .Include(c => c.Items).ThenInclude(i => i.Product) // eager load items + products
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };              // new empty cart
                await _ctx.Carts.AddAsync(cart);
                await _ctx.SaveChangesAsync();                    // save so it has an Id
            }
            return cart;
        }

        // just read the cart (no creation)
        public Task<Cart?> GetForUserAsync(string userId) =>
            _ctx.Carts
                .Include(c => c.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

        // add a product to the cart (increase qty if it already exists)
        public async Task AddItemAsync(string userId, int productId, int quantity)
        {
            var cart = await GetOrCreateForUserAsync(userId);

            var existing = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (existing == null)
                cart.Items.Add(new CartItem { ProductId = productId, Quantity = quantity });
            else
                existing.Quantity += quantity;
        }

        // set the quantity for a specific cart item
        public async Task UpdateItemQuantityAsync(string userId, int cartItemId, int quantity)
        {
            var cart = await GetForUserAsync(userId);
            var item = cart?.Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item != null) item.Quantity = quantity;
        }

        // remove one item from the cart
        public async Task RemoveItemAsync(string userId, int cartItemId)
        {
            var cart = await GetForUserAsync(userId);
            var item = cart?.Items.FirstOrDefault(i => i.Id == cartItemId);
            if (item != null) _ctx.CartItems.Remove(item);
        }

        // clear all items from the cart
        public async Task ClearAsync(string userId)
        {
            var cart = await GetForUserAsync(userId);
            if (cart != null) _ctx.CartItems.RemoveRange(cart.Items);
        }

        // save pending EF Core changes; returns true if something was written
        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
