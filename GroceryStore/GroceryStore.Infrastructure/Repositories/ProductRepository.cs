using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    // ProductRepository: query + CRUD for products using EF Core
    public class ProductRepository : IProductRepository
    {
        private static readonly HashSet<string> Sortable = new(StringComparer.OrdinalIgnoreCase)
            { "name", "price", "category" }; // allow sorting only on these simple fields

        private readonly GroceryDbContext _ctx;
        public ProductRepository(GroceryDbContext ctx) => _ctx = ctx;

        // returns a paged list of products with optional filter/search/sort
        public async Task<PagedResult<Product>> GetPagedAsync(
            int page, int pageSize, string? sortBy, bool desc, string? category, string? query)
        {
            var q = _ctx.Products.AsQueryable();

            // filter by category if provided
            if (!string.IsNullOrWhiteSpace(category))
                q = q.Where(p => p.Category == category);

            // basic text search on name or description
            if (!string.IsNullOrWhiteSpace(query))
                q = q.Where(p => p.Name.Contains(query) || p.Description.Contains(query));

            // apply sorting only if the field is in the whitelist
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
                q = q.OrderBy(p => p.Name); // default sort
            }

            // paging (skip/take)
            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<Product> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        // find by id (EF Core shortcut)
        public Task<Product?> GetByIdAsync(int id) => _ctx.Products.FindAsync(id).AsTask();

        // create
        public async Task AddAsync(Product product) => await _ctx.Products.AddAsync(product);

        // update (mark entity as modified)
        public Task UpdateAsync(Product product)
        {
            _ctx.Products.Update(product);
            return Task.CompletedTask;
        }

        // delete
        public Task DeleteAsync(Product product)
        {
            _ctx.Products.Remove(product);
            return Task.CompletedTask;
        }

        // save pending changes; true if at least one row affected
        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
