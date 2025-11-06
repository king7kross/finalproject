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
        public DbSet<Review> Reviews => Set<Review>(); // 👈 add

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            b.Entity<ApplicationUser>()
             .HasIndex(u => u.Email)
             .IsUnique();

            b.Entity<Product>()
             .Property(p => p.Price)
             .HasColumnType("decimal(18,2)");

            b.Entity<Product>()
              .Property(p => p.Discount)
              .HasColumnType("decimal(18,2)");

            b.Entity<OrderItem>()
             .Property(oi => oi.UnitPrice)
             .HasColumnType("decimal(18,2)");

            b.Entity<OrderItem>()
             .Property(oi => oi.DiscountAtPurchase)
             .HasColumnType("decimal(18,2)");

            b.Entity<Cart>()
             .HasMany(c => c.Items)
             .WithOne(i => i.Cart!)
             .HasForeignKey(i => i.CartId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<Order>()
             .HasMany(o => o.Items)
             .WithOne(i => i.Order!)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<Order>()
             .HasIndex(o => o.OrderNumber)
             .IsUnique();

            // 👇 Reviews ↔ Product (1:N)
            b.Entity<Review>()
             .HasOne(r => r.Product)
             .WithMany()                          // (optional) if you want Product.Reviews, add a collection on Product and change this
             .HasForeignKey(r => r.ProductId)
             .OnDelete(DeleteBehavior.Cascade);

            b.Entity<Review>()
             .Property(r => r.Comment)
             .HasMaxLength(500);

            b.Entity<Review>()
             .Property(r => r.UserName)
             .HasMaxLength(100);
        }
    }
}
