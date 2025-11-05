using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private static readonly HashSet<string> Sortable = new(StringComparer.OrdinalIgnoreCase)
            { "name", "price", "category" }; // whitelist simple fields per spec (sort) :contentReference[oaicite:1]{index=1}

        private readonly GroceryDbContext _ctx;
        public ProductRepository(GroceryDbContext ctx) => _ctx = ctx;

        public async Task<PagedResult<Product>> GetPagedAsync(
            int page, int pageSize, string? sortBy, bool desc, string? category, string? query)
        {
            var q = _ctx.Products.AsQueryable();

            if (!string.IsNullOrWhiteSpace(category))
                q = q.Where(p => p.Category == category);

            if (!string.IsNullOrWhiteSpace(query))
                q = q.Where(p => p.Name.Contains(query) || p.Description.Contains(query)); // search by name/description :contentReference[oaicite:2]{index=2}

            // Sorting (safe whitelist)
            if (!string.IsNullOrWhiteSpace(sortBy) && Sortable.Contains(sortBy))
            {
                q = (sortBy.ToLower()) switch
                {
                    "price" => (desc ? q.OrderByDescending(p => p.Price) : q.OrderBy(p => p.Price)),
                    "category" => (desc ? q.OrderByDescending(p => p.Category) : q.OrderBy(p => p.Category)),
                    _ => (desc ? q.OrderByDescending(p => p.Name) : q.OrderBy(p => p.Name)),
                };
            }
            else
            {
                q = q.OrderBy(p => p.Name);
            }

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Product> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public Task<Product?> GetByIdAsync(int id) => _ctx.Products.FindAsync(id).AsTask();

        public async Task AddAsync(Product product) => await _ctx.Products.AddAsync(product);

        public Task UpdateAsync(Product product)
        {
            _ctx.Products.Update(product);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Product product)
        {
            _ctx.Products.Remove(product);
            return Task.CompletedTask;
        }

        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
