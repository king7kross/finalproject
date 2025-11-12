using GroceryStore.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GroceryStore.Infrastructure.Persistence
{
    public class GroceryDbContext : IdentityDbContext<ApplicationUser>
    {
        public GroceryDbContext(DbContextOptions<GroceryDbContext> options) : base(options) { }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.Entity<ApplicationUser>()
             .HasIndex(i => i.Email)
             .IsUnique();

            b.Entity<Product>()
             .Property(i => i.Price)
             .HasColumnType("decimal(18,2)");

            b.Entity<Product>()
              .Property(i => i.Discount)
              .HasColumnType("decimal(18,2)");

            b.Entity<OrderItem>()
             .Property(i => i.UnitPrice)
             .HasColumnType("decimal(18,2)");

            b.Entity<OrderItem>()
             .Property(i => i.DiscountAtPurchase)
             .HasColumnType("decimal(18,2)");

            b.Entity<Cart>()
             .HasMany(i => i.Items)
             .WithOne(i => i.Cart!)
             .HasForeignKey(i => i.CartId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<Order>()
             .HasMany(i => i.Items)
             .WithOne(i => i.Order!)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<Order>()
             .HasIndex(i => i.OrderNumber)
             .IsUnique();

           
            b.Entity<Review>()
             .HasOne(i => i.Product)
             .WithMany()                        
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<Review>()
             .Property(i => i.Comment)
             .HasMaxLength(500);

            b.Entity<Review>()
             .Property(i => i.UserName)
             .HasMaxLength(100);
        }
    }
}
