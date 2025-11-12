using System.Security.Claims;
using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // orders are only for logged-in users
    public class OrdersController : ControllerBase
    {
        private readonly ICartRepository _carts;
        private readonly IProductRepository _products;
        private readonly IOrderRepository _orders;

        public OrdersController(
            ICartRepository carts,
            IProductRepository products,
            IOrderRepository orders)
        {
            _carts = carts;
            _products = products;
            _orders = orders;
        }

        // small helper to read current user id from claims
        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // POST: /api/orders/place -> creates an order from the user's cart
        [HttpPost("place")]
        public async Task<ActionResult<PlaceOrderResponse>> PlaceOrder()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // get the cart with items and product info
            var cart = await _carts.GetForUserAsync(userId);
            if (cart == null || cart.Items.Count == 0)
                return BadRequest(new { message = "Your cart is empty." });

            // check stock for every item before placing order
            foreach (var item in cart.Items)
            {
                if (item.Product == null)
                    return BadRequest(new { message = "A product in your cart no longer exists." });

                if (item.Product.AvailableQuantity <= 0)
                    return BadRequest(new { message = $"'{item.Product.Name}' is out of stock." });

                if (item.Quantity > item.Product.AvailableQuantity)
                    return BadRequest(new { message = $"Requested quantity for '{item.Product.Name}' exceeds available stock." });
            }

            
            var orderItems = cart.Items.Select(i =>
                (productId: i.ProductId,
                 quantity: i.Quantity,
                 unitPrice: i.Product!.Price,
                 discount: i.Product!.Discount))
                .ToList();

            // simple unique order number for tracking
            var orderNumber = GenerateOrderNumber();

            // create order (repository should also reduce stock)
            await _orders.CreateOrderAsync(userId, orderNumber, orderItems);

            // empty the cart after creating the order
            await _carts.ClearAsync(userId);

            // Single save for the shared DbContext (Unit of Work)
            var saved = await _orders.SaveChangesAsync();
            if (!saved)
                return StatusCode(500, new { message = "Could not place order." });

            return Ok(new PlaceOrderResponse { OrderNumber = orderNumber });
        }

        // GET: /api/orders/my -> returns the user's past orders
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<MyOrderResponse>>> MyOrders()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orders = await _orders.GetOrdersForUserAsync(userId);

            var orderresponse = orders.Select(o =>
            {
                var items = o.Items.Select(i => new MyOrderItemResponse
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    DiscountAtPurchase = i.DiscountAtPurchase
                }).ToList();

                var total = items.Sum(oi =>
                    (oi.UnitPrice - (oi.DiscountAtPurchase ?? 0m)) * oi.Quantity
                );

                return new MyOrderResponse
                {
                    Id = o.Id, // assuming your Order entity has Id
                    OrderNumber = o.OrderNumber,
                    CreatedAt = o.CreatedAt,
                    Items = items,
                    Total = total
                };
            });

            return Ok(orderresponse);
        }

        // GET /api/orders/analytics/top-products?year=YYYY&month=MM&top=5
        // Returns 5 most ordered products for given month/year. Defaults to current month/year.
        [HttpGet("analytics/top-products")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<ActionResult<IEnumerable<TopProductResponse>>> TopProducts([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int? top)
        {
            var dateTime = DateTime.UtcNow;
            int years = year ?? dateTime.Year;
            int months = month ?? dateTime.Month;

            if (months < 1 || months > 12) return BadRequest(new { message = "Month must be between 1 and 12." });
            int range = top.GetValueOrDefault(5);
            if (range <= 0) range = 5;
            if (range > 50) range = 50;

            var data = await _orders.GetTopProductsByMonthAsync(years, months, range);
            return Ok(data);
        }

        // builds a readable id like ORD-20250101... with a short random suffix
        private static string GenerateOrderNumber()
        {
            var currentTime = DateTime.Now.ToString("yyyyMMddHHmmss");
            var randomString = Guid.NewGuid().ToString("N")[..6].ToUpper();
            return $"ORD-{currentTime}-{randomString}";
        }
    }
}
