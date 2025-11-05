using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface IProductRepository
    {
        Task<PagedResult<Product>> GetPagedAsync(
            int page, int pageSize,
            string? sortBy, bool desc,
            string? category, string? query);

        Task<Product?> GetByIdAsync(int id);
        Task AddAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Product product);
        Task<bool> SaveChangesAsync();
    }
}
