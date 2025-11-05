using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // only logged-in users can access cart per spec :contentReference[oaicite:4]{index=4}
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _carts;
        private readonly IProductRepository _products;

        public CartController(ICartRepository carts, IProductRepository products)
        {
            _carts = carts;
            _products = products;
        }

        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET /api/cart
        [HttpGet]
        public async Task<ActionResult<CartResponse>> Get()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var cart = await _carts.GetOrCreateForUserAsync(userId);
            var resp = new CartResponse
            {
                Items = cart.Items.Select(i => new CartItemResponse
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "",
                    ImageUrl = i.Product?.ImageUrl ?? "",
                    Price = i.Product?.Price ?? 0m,
                    Discount = i.Product?.Discount,
                    Quantity = i.Quantity,
                    AvailableQuantity = i.Product?.AvailableQuantity ?? 0
                }).ToList()
            };
            // If Items is empty, the UI will show "No Items in Cart" per mockup :contentReference[oaicite:5]{index=5}
            return Ok(resp);
        }

        // POST /api/cart/items
        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest req)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (req.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0." });

            var product = await _products.GetByIdAsync(req.ProductId);
            if (product == null) return NotFound(new { message = "Product not found." });

            // Out of stock & stock checks per spec :contentReference[oaicite:6]{index=6}
            if (product.AvailableQuantity <= 0)
                return BadRequest(new { message = "Product is out of stock." });

            if (req.Quantity > product.AvailableQuantity)
                return BadRequest(new { message = "Requested quantity exceeds available stock." });

            await _carts.AddItemAsync(userId, req.ProductId, req.Quantity);
            var saved = await _carts.SaveChangesAsync();
            if (!saved) return StatusCode(500, new { message = "Could not add item." });

            return Ok(new { message = "Item added to cart." });
        }

        // PUT /api/cart/items/{itemId}
        [HttpPut("items/{itemId:int}")]
        public async Task<IActionResult> UpdateQuantity(int itemId, [FromBody] UpdateCartItemRequest req)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (req.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0." });

            // check stock using the product joined via current cart
            var cart = await _carts.GetForUserAsync(userId);
            var item = cart?.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) return NotFound(new { message = "Cart item not found." });

            var product = item.Product;
            if (product == null) return NotFound(new { message = "Product not found." });

            if (product.AvailableQuantity <= 0)
                return BadRequest(new { message = "Product is out of stock." });

            if (req.Quantity > product.AvailableQuantity)
                return BadRequest(new { message = "Requested quantity exceeds available stock." });

            await _carts.UpdateItemQuantityAsync(userId, itemId, req.Quantity);
            var saved = await _carts.SaveChangesAsync();
            if (!saved) return StatusCode(500, new { message = "Could not update item." });

            return Ok(new { message = "Cart item updated." });
        }

        // DELETE /api/cart/items/{itemId}
        [HttpDelete("items/{itemId:int}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _carts.RemoveItemAsync(userId, itemId);
            var saved = await _carts.SaveChangesAsync();
            if (!saved) return StatusCode(500, new { message = "Could not remove item." });

            return NoContent();
        }
    }
}
