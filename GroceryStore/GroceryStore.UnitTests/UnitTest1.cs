using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using GroceryStore.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GroceryStore.UnitTests
{
    // basic unit tests to check core repository behavior
    public class UnitTest1
    {
        // in-memory EF Core options for isolated tests
        private DbContextOptions<GroceryDbContext> GetInMemoryOptions()
        {
            return new DbContextOptionsBuilder<GroceryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public void TestSimpleUserCreation()
        {
            // Simple object test: create user and verify fields
            var user = new ApplicationUser
            {
                Id = "u1",
                UserName = "simpleuser",
                Email = "simple@example.com",
                FullName = "Simple User",
                IsAdmin = false
            };

            Assert.Equal("u1", user.Id);
            Assert.Equal("simpleuser", user.UserName);
            Assert.Equal("simple@example.com", user.Email);
            Assert.Equal("Simple User", user.FullName);
            Assert.False(user.IsAdmin);
        }

        [Fact]
        public async Task TestGetCartReturnsItems()
        {
            // Arrange: create product and add to cart
            var options = GetInMemoryOptions();
            using var context = new GroceryDbContext(options);
            var repository = new CartRepository(context);

            var userId = "user1";
            var product = new Product
            {
                Id = 1,
                Name = "Test Product",
                Price = 10.0m,
                Category = "TestCategory",
                Description = "desc",
                ImageUrl = "img.png"
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            await repository.AddItemAsync(userId, 1, 2);
            await repository.SaveChangesAsync();

            // Act: read cart back
            var cart = await repository.GetForUserAsync(userId);

            // Assert: cart exists and has one item with qty=2
            Assert.NotNull(cart);
            Assert.Single(cart!.Items);
            Assert.Equal(2, cart.Items.First().Quantity);
        }

        [Fact]
        public async Task TestGetProductsReturnsList()
        {
            // Arrange: seed a product
            var options = GetInMemoryOptions();
            using var context = new GroceryDbContext(options);
            var repository = new ProductRepository(context);

            var product = new Product
            {
                Id = 1,
                Name = "Test Product",
                Price = 10.0m,
                Category = "Test",
                Description = "desc",
                ImageUrl = "img.png"
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            // Act: fetch paged list
            var result = await repository.GetPagedAsync(1, 10, null, false, null, null);

            // Assert: one item returned and name matches
            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.Items);
            Assert.Equal("Test Product", result.Items.First().Name);
        }

        [Fact]
        public async Task TestPlaceOrderSuccess()
        {
            // Arrange: product with stock and one order item
            var options = GetInMemoryOptions();
            using var context = new GroceryDbContext(options);
            var repository = new OrderRepository(context);

            var userId = "user1";
            var product = new Product
            {
                Id = 1,
                Name = "Test Product",
                Price = 10.0m,
                AvailableQuantity = 10,
                Category = "TestCat",
                Description = "desc",
                ImageUrl = "img.png"
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var items = new List<(int productId, int quantity, decimal unitPrice, decimal? discount)>
            {
                (1, 2, 10.0m, null)
            };

            // Act: create order and persist changes
            var order = await repository.CreateOrderAsync(userId, "ORD001", items);
            await repository.SaveChangesAsync();

            // Assert: order created and stock reduced by 2
            Assert.NotNull(order);
            Assert.Equal("ORD001", order.OrderNumber);
            Assert.Single(order.Items);
            var updatedProduct = await context.Products.FindAsync(1);
            Assert.Equal(8, updatedProduct!.AvailableQuantity);
        }

        [Fact]
        public void TestCartSubtotalCalculation()
        {
            // Arrange: two cart items with different discounts/qty
            var cart = new Cart
            {
                Items = new List<CartItem>
                {
                    new CartItem { Product = new Product { Price = 10.0m, Discount = 2.0m, Category = "c", Description = "d", ImageUrl = "i" }, Quantity = 2 },
                    new CartItem { Product = new Product { Price = 20.0m, Discount = 0.0m, Category = "c", Description = "d", ImageUrl = "i" }, Quantity = 1 }
                }
            };

            // Act: compute subtotals and total
            var subtotal1 = (cart.Items.First().Product!.Price - cart.Items.First().Product!.Discount) * cart.Items.First().Quantity;
            var subtotal2 = (cart.Items.Last().Product!.Price - cart.Items.Last().Product!.Discount) * cart.Items.Last().Quantity;
            var total = subtotal1 + subtotal2;

            // Assert: (10-2)*2 = 16 and (20-0)*1 = 20; total 36
            Assert.Equal(16.0m, subtotal1);
            Assert.Equal(20.0m, subtotal2);
            Assert.Equal(36.0m, total);
        }
    }
}
