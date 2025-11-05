namespace GroceryStore.Application.Models
{
    public class CartResponse
    {
        public IList<CartItemResponse> Items { get; set; } = new List<CartItemResponse>();
    }
}
