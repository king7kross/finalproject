using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Persistence;
using GroceryStore.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;


namespace GroceryStore.UnitTests
{
    public class UnitTest1
    {
        private DbContextOptions<GroceryDbContext> GetInMemoryOptions()
        {
            return new DbContextOptionsBuilder<GroceryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

       

        [Fact]
        public void TestSimpleUserCreation()
        {
            // Simple, self-contained test — constructs an ApplicationUser and verifies properties.
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
            // Arrange
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

            // Act
            var cart = await repository.GetForUserAsync(userId);

            // Assert
            Assert.NotNull(cart);
            Assert.Single(cart.Items);
            Assert.Equal(2, cart.Items.First().Quantity);
        }

        [Fact]
        public async Task TestGetProductsReturnsList()
        {
            // Arrange
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

            // Act
            var result = await repository.GetPagedAsync(1, 10, null, false, null, null);

            // Assert
            Assert.Equal(1, result.TotalCount);
            Assert.Single(result.Items);
            Assert.Equal("Test Product", result.Items.First().Name);
        }

        [Fact]
        public async Task TestPlaceOrderSuccess()
        {
            // Arrange
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

            // Act
            var order = await repository.CreateOrderAsync(userId, "ORD001", items);
            await repository.SaveChangesAsync();

            // Assert
            Assert.NotNull(order);
            Assert.Equal("ORD001", order.OrderNumber);
            Assert.Single(order.Items);
            // reload product from context to ensure tracking reflects change
            var updatedProduct = await context.Products.FindAsync(1);
            Assert.Equal(8, updatedProduct!.AvailableQuantity); // Stock decremented
        }

        [Fact]
        public void TestCartSubtotalCalculation()
        {
            // Arrange
            var cart = new Cart
            {
                Items = new List<CartItem>
                {
                    new CartItem { Product = new Product { Price = 10.0m, Discount = 2.0m, Category = "c", Description = "d", ImageUrl = "i" }, Quantity = 2 },
                    new CartItem { Product = new Product { Price = 20.0m, Discount = 0.0m, Category = "c", Description = "d", ImageUrl = "i" }, Quantity = 1 }
                }
            };

            // Act
            var subtotal1 = (cart.Items.First().Product!.Price - cart.Items.First().Product!.Discount) * cart.Items.First().Quantity;
            var subtotal2 = (cart.Items.Last().Product!.Price - cart.Items.Last().Product!.Discount) * cart.Items.Last().Quantity;
            var total = subtotal1 + subtotal2;

            // Assert
            Assert.Equal(16.0m, subtotal1); // (10 - 2) * 2
            Assert.Equal(20.0m, subtotal2); // (20 - 0) * 1
            Assert.Equal(36.0m, total);
        }
    }
}
