using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _repo;

        public ProductsController(IProductRepository repo)
        {
            // DI: products repository for data access
            _repo = repo;
        }

        // PUBLIC: GET /api/products?page=&pageSize=&sortBy=&desc=&category=&q=
        // returns a paged, sorted, and filtered product list
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<ProductResponse>>> Get([FromQuery] ProductListQuery query)
        {
            var paged = await _repo.GetPagedAsync(
                query.Page <= 0 ? 1 : query.Page,
                query.PageSize <= 0 ? 12 : query.PageSize,
                query.SortBy, query.Desc,
                query.Category, query.Q);

            // map entities to a lightweight response for the client
            return Ok(new PagedResult<ProductResponse>
            {
                Page = paged.Page,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount,
                Items = paged.Items.Select(MapToResponse).ToList()
            });
        }

        // PUBLIC: GET /api/products/{id} -> fetch single product by id
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductResponse>> GetById(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound(); // not found -> 404
            return Ok(MapToResponse(product));
        }

        // ADMIN: POST /api/products -> create a new product
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] ProductCreateRequest req)
        {
            // ModelState filled by validators (short-circuits on invalid input)
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

            // return 201 + location header pointing to GetById
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToResponse(product));
        }

        // ADMIN: PUT /api/products/{id} -> update an existing product
        [HttpPut("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();

            // copy over fields from request
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

        // ADMIN: DELETE /api/products/{id} -> remove a product
        [HttpDelete("{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return NotFound();

            await _repo.DeleteAsync(product);
            await _repo.SaveChangesAsync();

            return NoContent(); // deletion succeeded, nothing to return
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
