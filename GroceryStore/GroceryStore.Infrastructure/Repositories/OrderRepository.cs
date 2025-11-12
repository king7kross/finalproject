using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    // OrderRepository: creates orders and fetches a user's order history
    public class OrderRepository : IOrderRepository
    {
        private readonly GroceryDbContext _grocerydb;
        public OrderRepository(GroceryDbContext grocerydb) => _grocerydb = grocerydb;

        // create a new order from given line items and reduce product stock
        public async Task<Order> CreateOrderAsync(
            string userId, string orderNumber,
            IEnumerable<(int productId, int quantity, decimal unitPrice, decimal? discount)> items)
        {
            var order = new Order { UserId = userId, OrderNumber = orderNumber };

            foreach (var item in items)
            {
                // price/discount at purchase time
                order.Items.Add(new OrderItem
                {
                    ProductId = item.productId,
                    Quantity = item.quantity,
                    UnitPrice = item.unitPrice,
                    DiscountAtPurchase = item.discount
                });

                // reduce available stock for this product
                var product = await _grocerydb.Products.FirstAsync(p => p.Id == item.productId);
                product.AvailableQuantity -= item.quantity;
            }

            _grocerydb.Orders.Add(order); // track the new order
            return order;          
        }

        // list orders for a user (newest first), including items and product info
        public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string userId)
        {
            return await _grocerydb.Orders
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // Admin analytics: Top 5 products for a given month/year
        public async Task<IReadOnlyList<TopProductResponse>> GetTopProductsByMonthAsync(int year, int month, int topN = 5)
        {
            if (month < 1 || month > 12) throw new ArgumentOutOfRangeException(nameof(month));

            var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(1);

            // Sum quantities per product within the month range
            var query =
                from oi in _grocerydb.OrderItems
                    .Include(x => x.Order)
                    .Include(x => x.Product)
                where oi.Order != null
                   && oi.Order.CreatedAt >= start
                   && oi.Order.CreatedAt < end
                group oi by new { oi.ProductId, oi.Product!.Name } into g
                orderby g.Sum(x => x.Quantity) descending, g.Key.Name ascending
                select new TopProductResponse
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.Name,
                    TotalQuantity = g.Sum(x => x.Quantity)
                };

            if (topN <= 0) topN = 5;
            if (topN > 50) topN = 50; // basic safety bound

            return await query.Take(topN).ToListAsync();
        }

        // persist pending changes; true if something was saved
        public async Task<bool> SaveChangesAsync() => (await _grocerydb.SaveChangesAsync()) > 0;
    }
}
