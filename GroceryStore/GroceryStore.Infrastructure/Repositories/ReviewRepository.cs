using GroceryStore.Application.Interfaces;
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly GroceryDbContext _ctx;
        public ReviewRepository(GroceryDbContext ctx) => _ctx = ctx;

        public async Task<List<Review>> GetForProductAsync(int productId)
        {
            return await _ctx.Reviews
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Review review) => await _ctx.Reviews.AddAsync(review);

        public async Task<bool> SaveChangesAsync() => (await _ctx.SaveChangesAsync()) > 0;
    }
}
