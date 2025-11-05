namespace GroceryStore.Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }               // Internal PK
        public string OrderNumber { get; set; } = default!; // Unique order id shown to user :contentReference[oaicite:14]{index=14}
        public string UserId { get; set; } = default!;
        public ApplicationUser? User { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}