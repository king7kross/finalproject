using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _repo;
        private readonly IReviewRepository _reviews;                // reviews repo
        private readonly UserManager<ApplicationUser> _userManager; // for current user

        public ProductsController(
            IProductRepository repo,
            IReviewRepository reviews,
            UserManager<ApplicationUser> userManager)
        {
            _repo = repo;
            _reviews = reviews;
            _userManager = userManager;
        }

        // PUBLIC: GET /api/products?page=&pageSize=&sortBy=&desc=&category=&q=
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<ProductResponse>>> Get([FromQuery] ProductListQuery query)
        {
            var paged = await _repo.GetPagedAsync(
                query.Page <= 0 ? 1 : query.Page,
                query.PageSize <= 0 ? 12 : query.PageSize,
                query.SortBy, query.Desc,
                query.Category, query.Q);

            return Ok(new PagedResult<ProductResponse>
            {
                Page = paged.Page,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
                Items = paged.Items.Select(MapToResponse).ToList()
            });
        }

        // PUBLIC: GET /api/products/{id}
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductResponse>> GetById(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(MapToResponse(product));
        }

        // ADMIN: POST /api/products
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] ProductCreateRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var product = new Product
            {
                Name = req.Name,
                Description = req.Description,
                Category = req.Category,
                AvailableQuantity = req.AvailableQuantity,
                ImageUrl = req.ImageUrl,
                Price = req.Price,
                Discount = req.Discount,
                Specification = req.Specification
            };

            await _repo.AddAsync(product);
            await _repo.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToResponse(product));
        }

        // ADMIN: PUT /api/products/{id}
        [HttpPut("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();

            product.Name = req.Name;
            product.Description = req.Description;
            product.Category = req.Category;
            product.AvailableQuantity = req.AvailableQuantity;
            product.ImageUrl = req.ImageUrl;
            product.Price = req.Price;
            product.Discount = req.Discount;
            product.Specification = req.Specification;

            await _repo.UpdateAsync(product);
            await _repo.SaveChangesAsync();

            return Ok(MapToResponse(product));
        }

        // ADMIN: DELETE /api/products/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();

            await _repo.DeleteAsync(product);
            await _repo.SaveChangesAsync();

            return NoContent();
        }

        // -------- Reviews --------

        // PUBLIC: GET /api/products/{id}/reviews
        [HttpGet("{id:int}/reviews")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ReviewResponse>>> GetReviews(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();

            var list = await _reviews.GetForProductAsync(id);
            var resp = list.Select(r => new ReviewResponse
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserName = r.UserName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            });

            return Ok(resp);
        }

        // AUTH: POST /api/products/{id}/reviews
        [HttpPost("{id:int}/reviews")]
        [Authorize]
        public async Task<ActionResult<ReviewResponse>> CreateReview(int id, [FromBody] CreateReviewRequest req)
        {
            if (req.Rating < 1 || req.Rating > 5)
                return BadRequest(new { message = "Rating must be between 1 and 5." });
            if (string.IsNullOrWhiteSpace(req.Comment))
                return BadRequest(new { message = "Comment is required." });

            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();

            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var entity = new Review
            {
                ProductId = id,
                UserId = user.Id,
                UserName = string.IsNullOrWhiteSpace(user.FullName) ? user.Email : user.FullName,
                Rating = req.Rating,
                Comment = req.Comment.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            await _reviews.AddAsync(entity);
            var ok = await _reviews.SaveChangesAsync();
            if (!ok) return StatusCode(500, new { message = "Could not save review." });

            var resp = new ReviewResponse
            {
                Id = entity.Id,
                ProductId = entity.ProductId,
                UserId = entity.UserId,
                UserName = entity.UserName,
                Rating = entity.Rating,
                Comment = entity.Comment,
                CreatedAt = entity.CreatedAt
            };

            return CreatedAtAction(nameof(GetReviews), new { id = entity.ProductId }, resp);
        }

        // helper: map domain entity to response DTO
        private static ProductResponse MapToResponse(Product p) => new ProductResponse
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Category = p.Category,
            AvailableQuantity = p.AvailableQuantity,
            ImageUrl = p.ImageUrl,
            Price = p.Price,
            Discount = p.Discount,
            Specification = p.Specification
        };
    }
}
