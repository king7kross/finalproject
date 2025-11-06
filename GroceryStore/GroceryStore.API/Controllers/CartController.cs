using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // only signed-in users can work with their cart
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _carts;
        private readonly IProductRepository _products;

        public CartController(ICartRepository carts, IProductRepository products)
        {
            _carts = carts;
            _products = products;
        }

        // quick helper: read the current user's id from claims
        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET /api/cart -> returns the current user's cart
        [HttpGet]
        public async Task<ActionResult<CartResponse>> Get()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized(); // no user -> no cart

            var cart = await _carts.GetOrCreateForUserAsync(userId);

            // map entity to a simple response model for the client
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

            // if Items is empty, frontend will show "No Items in Cart"
            return Ok(resp);
        }

        // POST /api/cart/items -> add a product to the cart
        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest req)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (req.Quantity <= 0) // basic quantity check
                return BadRequest(new { message = "Quantity must be greater than 0." });

            var product = await _products.GetByIdAsync(req.ProductId);
            if (product == null) return NotFound(new { message = "Product not found." });

            // stock validation before adding
            if (product.AvailableQuantity <= 0)
                return BadRequest(new { message = "Product is out of stock." });

            if (req.Quantity > product.AvailableQuantity)
                return BadRequest(new { message = "Requested quantity exceeds available stock." });

            await _carts.AddItemAsync(userId, req.ProductId, req.Quantity);

            // save changes and confirm
            var saved = await _carts.SaveChangesAsync();
            if (!saved) return StatusCode(500, new { message = "Could not add item." });

            return Ok(new { message = "Item added to cart." });
        }

        // PUT /api/cart/items/{itemId} -> change quantity of an item
        [HttpPut("items/{itemId:int}")]
        public async Task<IActionResult> UpdateQuantity(int itemId, [FromBody] UpdateCartItemRequest req)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            if (req.Quantity <= 0)
                return BadRequest(new { message = "Quantity must be greater than 0." });

            // find the item in this user's cart
            var cart = await _carts.GetForUserAsync(userId);
            var item = cart?.Items.FirstOrDefault(i => i.Id == itemId);
            if (item == null) return NotFound(new { message = "Cart item not found." });

            var product = item?.Product;
            if (product == null) return NotFound(new { message = "Product not found." });

            // stock checks before update
            if (product.AvailableQuantity <= 0)
                return BadRequest(new { message = "Product is out of stock." });

            if (req.Quantity > product.AvailableQuantity)
                return BadRequest(new { message = "Requested quantity exceeds available stock." });

            await _carts.UpdateItemQuantityAsync(userId, itemId, req.Quantity);

            var saved = await _carts.SaveChangesAsync();
            if (!saved) return StatusCode(500, new { message = "Could not update item." });

            return Ok(new { message = "Cart item updated." });
        }

        // DELETE /api/cart/items/{itemId} -> remove an item from the cart
        [HttpDelete("items/{itemId:int}")]
        public async Task<IActionResult> RemoveItem(int itemId)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            await _carts.RemoveItemAsync(userId, itemId);

            var saved = await _carts.SaveChangesAsync();
            if (!saved) return StatusCode(500, new { message = "Could not remove item." });

            return NoContent(); // nothing to return after delete
        }
    }
}
