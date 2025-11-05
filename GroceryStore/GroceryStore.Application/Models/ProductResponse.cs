namespace GroceryStore.Application.Models
{
    public class ProductResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Category { get; set; } = default!;
        public int AvailableQuantity { get; set; }
        public string ImageUrl { get; set; } = default!;
        public decimal Price { get; set; }
        public decimal? Discount { get; set; }
        public string? Specification { get; set; }
    }
}
