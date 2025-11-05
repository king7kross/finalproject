namespace GroceryStore.Application.Models
{
    public class MyOrderResponse
    {
        public string OrderNumber { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public IList<MyOrderItemResponse> Items { get; set; } = new List<MyOrderItemResponse>();
    }
}
