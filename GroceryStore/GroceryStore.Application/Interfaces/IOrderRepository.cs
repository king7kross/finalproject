using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(string userId, string orderNumber, IEnumerable<(int productId, int quantity, decimal unitPrice, decimal? discount)> items);
        Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string userId);
        Task<bool> SaveChangesAsync();
    }
}
