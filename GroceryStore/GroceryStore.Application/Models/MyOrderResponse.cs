namespace GroceryStore.Application.Models
{
    public class MyOrderResponse
    {
        public int Id { get; set; }                       // maps to Order.Id
        public string OrderNumber { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public IList<MyOrderItemResponse> Items { get; set; } = new List<MyOrderItemResponse>();
        public decimal Total { get; set; }                // computed total for the order
    }
}
