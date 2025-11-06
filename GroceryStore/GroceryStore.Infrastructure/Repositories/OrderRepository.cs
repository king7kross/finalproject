using GroceryStore.Application.Interfaces;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    // OrderRepository: creates orders and fetches a user's order history
    public class OrderRepository : IOrderRepository
    {
        private readonly GroceryDbContext _ctx;
        public OrderRepository(GroceryDbContext ctx) => _ctx = ctx;

        // create a new order from given line items and reduce product stock
        public async Task<Order> CreateOrderAsync(
            string userId, string orderNumber,
            IEnumerable<(int productId, int quantity, decimal unitPrice, decimal? discount)> items)
        {
            var order = new Order { UserId = userId, OrderNumber = orderNumber };

            foreach (var it in items)
            {
                // snapshot price/discount at purchase time
                order.Items.Add(new OrderItem
                {
                    ProductId = it.productId,
                    Quantity = it.quantity,
                    UnitPrice = it.unitPrice,
                    DiscountAtPurchase = it.discount
                });

                // reduce available stock for this product
                var product = await _ctx.Products.FirstAsync(p => p.Id == it.productId);
                product.AvailableQuantity -= it.quantity;
            }

            _ctx.Orders.Add(order); // track the new order
            return order;           // caller will SaveChanges
        }

        // list orders for a user (newest first), including items and product info
        public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string userId)
        {
            return await _ctx.Orders
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // persist pending changes; true if something was saved
        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
