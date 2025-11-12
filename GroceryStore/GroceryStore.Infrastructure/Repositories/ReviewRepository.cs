using GroceryStore.Application.Interfaces;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly GroceryDbContext _grocerydb;
        public ReviewRepository(GroceryDbContext grocerydb) => _grocerydb = grocerydb;

        public async Task<List<Review>> GetForProductAsync(int productId)
        {
            return await _grocerydb.Reviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Review review) => await _grocerydb.Reviews.AddAsync(review);

        public async Task<bool> SaveChangesAsync() => (await _grocerydb.SaveChangesAsync()) > 0;
    }
}
