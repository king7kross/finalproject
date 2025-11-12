using System.ComponentModel.DataAnnotations;

namespace GroceryStore.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }

        [Required] // Product Name 
        [MaxLength(100)]
        public string Name { get; set; } = default!;

        [Required, MaxLength(255)] // Description
        public string Description { get; set; } = default!;

        [Required, MaxLength(100)] // Category 
        public string Category { get; set; } = default!;

        [Required]                 // Available Quantity numeric, required
        public int AvailableQuantity { get; set; }

        [Required]                 // JPG/PNG check 
        public string ImageUrl { get; set; } = default!;

        [Required]                 // Price decimal
        public decimal Price { get; set; }

        public decimal? Discount { get; set; } // optional

        [MaxLength(100)]           // Specification optional 
        public string? Specification { get; set; }
    }
}

