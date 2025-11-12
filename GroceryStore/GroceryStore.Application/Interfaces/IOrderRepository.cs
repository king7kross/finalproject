// IOrderRepository.cs
// create orders from the cart and fetch a user's past orders

using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(string userId, string orderNumber,  // place a new order                          
            IEnumerable<(int productId, int quantity, decimal unitPrice, decimal? discount)> items);

        Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string userId); // list my orders

        // Admin analytics: top products for a given month/year
        Task<IReadOnlyList<TopProductResponse>> GetTopProductsByMonthAsync(int year, int month, int topN = 5);

        Task<bool> SaveChangesAsync();                                   // persist changes
    }
}
