using System.ComponentModel.DataAnnotations;

namespace GroceryStore.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }

        [Required, MaxLength(100)] // Product Name ≤100, required :contentReference[oaicite:6]{index=6}
        public string Name { get; set; } = default!;

        [Required, MaxLength(255)] // Description ≤255, required :contentReference[oaicite:7]{index=7}
        public string Description { get; set; } = default!;

        [Required, MaxLength(100)] // Category ≤100, required :contentReference[oaicite:8]{index=8}
        public string Category { get; set; } = default!;

        [Required]                 // Available Quantity numeric, required :contentReference[oaicite:9]{index=9}
        public int AvailableQuantity { get; set; }

        [Required]                 // JPG/PNG check will be at API validation step :contentReference[oaicite:10]{index=10}
        public string ImageUrl { get; set; } = default!;

        [Required]                 // Price decimal, required :contentReference[oaicite:11]{index=11}
        public decimal Price { get; set; }

        public decimal? Discount { get; set; } // optional :contentReference[oaicite:12]{index=12}

        [MaxLength(100)]           // Specification optional ≤100 :contentReference[oaicite:13]{index=13}
        public string? Specification { get; set; }
    }
}

