using GroceryStore.Domain.Entities;

namespace GroceryStore.Application.Interfaces
{
    public interface IReviewRepository
    {
        Task<List<Review>> GetForProductAsync(int productId);
        Task AddAsync(Review review);
        Task<bool> SaveChangesAsync();
    }
}
