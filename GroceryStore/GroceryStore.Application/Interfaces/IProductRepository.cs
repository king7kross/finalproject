// IProductRepository.cs
// read/write operations for products 

using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface IProductRepository
    {
        Task<PagedResult<Product>> GetPagedAsync(                   // list with paging/filter/sort
            int page, int pageSize,
            string? sortBy, bool desc,
            string? category, string? query);

        Task<Product?> GetByIdAsync(int id);                        // find one product
        Task AddAsync(Product product);                              // create
        Task UpdateAsync(Product product);                           // update
        Task DeleteAsync(Product product);                           // remove
        Task<bool> SaveChangesAsync();                               // persist changes
    }
}
