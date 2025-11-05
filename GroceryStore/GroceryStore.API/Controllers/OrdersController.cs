using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // orders require login per spec
    public class OrdersController : ControllerBase
    {
        private readonly ICartRepository _carts;
        private readonly IProductRepository _products;
        private readonly IOrderRepository _orders;

        public OrdersController(ICartRepository carts, IProductRepository products, IOrderRepository orders)
        {
            _carts = carts;
            _products = products;
            _orders = orders;
        }

        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // POST: /api/orders/place
        [HttpPost("place")]
        public async Task<ActionResult<PlaceOrderResponse>> PlaceOrder()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // load cart with product data
            var cart = await _carts.GetForUserAsync(userId);
            if (cart == null || cart.Items.Count == 0)
                return BadRequest(new { message = "Your cart is empty." });

            // validate stock for each item (must be >0 and sufficient)
            foreach (var item in cart.Items)
            {
                if (item.Product == null)
                    return BadRequest(new { message = "A product in your cart no longer exists." });

                if (item.Product.AvailableQuantity <= 0)
                    return BadRequest(new { message = $"'{item.Product.Name}' is out of stock." });

                if (item.Quantity > item.Product.AvailableQuantity)
                    return BadRequest(new { message = $"Requested quantity for '{item.Product.Name}' exceeds available stock." });
            }

            // build the order items snapshot (unit price & discount captured now)
            var toCreate = cart.Items.Select(i =>
                (productId: i.ProductId,
                 quantity: i.Quantity,
                 unitPrice: i.Product!.Price,
                 discount: i.Product!.Discount))
                 .ToList();

            // generate a unique order number (index enforced in Db)
            var orderNumber = GenerateOrderNumber();

            // create order (also decrements stock in repository)
            var order = await _orders.CreateOrderAsync(userId, orderNumber, toCreate);

            // clear cart
            await _carts.ClearAsync(userId);

            // persist both changes (simple approach; repos share the same scoped DbContext)
            var savedOrder = await _orders.SaveChangesAsync();
            var savedCart = await _carts.SaveChangesAsync();

            if (!savedOrder || !savedCart)
                return StatusCode(500, new { message = "Could not place order." });

            return Ok(new PlaceOrderResponse { OrderNumber = orderNumber });
        }

        // GET: /api/orders/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<MyOrderResponse>>> MyOrders()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var orders = await _orders.GetOrdersForUserAsync(userId);
            var resp = orders.Select(o => new MyOrderResponse
            {
                OrderNumber = o.OrderNumber,
                CreatedAt = o.CreatedAt,
                Items = o.Items.Select(oi => new MyOrderItemResponse
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product?.Name ?? "",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    DiscountAtPurchase = oi.DiscountAtPurchase
                }).ToList()
            });

            return Ok(resp);
        }

        // simple unique order number (timestamp + random suffix)
        private static string GenerateOrderNumber()
        {
            var ts = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var rnd = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
            return $"ORD-{ts}-{rnd}";
        }
    }
}
