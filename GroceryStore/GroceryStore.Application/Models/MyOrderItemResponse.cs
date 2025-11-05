namespace GroceryStore.Application.Models
{
    public class MyOrderItemResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = default!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? DiscountAtPurchase { get; set; }
    }
}
