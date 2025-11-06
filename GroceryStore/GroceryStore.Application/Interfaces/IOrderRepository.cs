// IOrderRepository.cs
// create orders from the cart and fetch a user's past orders

using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(                                // place a new order
            string userId,
            string orderNumber,
            IEnumerable<(int productId, int quantity, decimal unitPrice, decimal? discount)> items);

        Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string userId); // list my orders
        Task<bool> SaveChangesAsync();                                   // persist changes
    }
}
