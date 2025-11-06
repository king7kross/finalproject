using System.ComponentModel.DataAnnotations;

namespace GroceryStore.Domain.Entities
{
    public class Review
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        [Required]
        public string UserId { get; set; } = default!;

        [MaxLength(100)]
        public string? UserName { get; set; }   // display name (FullName or Email)

        [Range(1, 5)]
        public int Rating { get; set; }         // 1..5

        [Required, MaxLength(500)]
        public string Comment { get; set; } = default!;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
