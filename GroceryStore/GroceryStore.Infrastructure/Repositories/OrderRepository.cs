using GroceryStore.Application.Interfaces;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly GroceryDbContext _ctx;
        public OrderRepository(GroceryDbContext ctx) => _ctx = ctx;

        public async Task<Order> CreateOrderAsync(string userId, string orderNumber,
            IEnumerable<(int productId, int quantity, decimal unitPrice, decimal? discount)> items)
        {
            var order = new Order { UserId = userId, OrderNumber = orderNumber };
            foreach (var it in items)
            {
                order.Items.Add(new OrderItem
                {
                    ProductId = it.productId,
                    Quantity = it.quantity,
                    UnitPrice = it.unitPrice,
                    DiscountAtPurchase = it.discount
                });

                // decrement stock (per spec) :contentReference[oaicite:3]{index=3}
                var product = await _ctx.Products.FirstAsync(p => p.Id == it.productId);
                product.AvailableQuantity -= it.quantity;
            }

            _ctx.Orders.Add(order);
            return order;
        }

        public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string userId)
        {
            return await _ctx.Orders.Include(o => o.Items).ThenInclude(i => i.Product)
                                    .Where(o => o.UserId == userId)
                                    .OrderByDescending(o => o.CreatedAt)
                                    .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
