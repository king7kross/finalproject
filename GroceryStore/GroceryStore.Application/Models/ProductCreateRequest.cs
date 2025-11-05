namespace GroceryStore.Application.Models
{
    public class ProductCreateRequest
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string Category { get; set; } = default!;
        public int AvailableQuantity { get; set; }
        public string ImageUrl { get; set; } = default!; // jpg/png checked by validator
        public decimal Price { get; set; }
        public decimal? Discount { get; set; }
        public string? Specification { get; set; }
    }
}
