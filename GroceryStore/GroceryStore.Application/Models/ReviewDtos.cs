namespace GroceryStore.Application.Models
{
    public class CreateReviewRequest
    {
        public int Rating { get; set; }          // 1..5
        public string Comment { get; set; } = "";
    }

    public class ReviewResponse
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string UserId { get; set; } = default!;
        public string? UserName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
}

