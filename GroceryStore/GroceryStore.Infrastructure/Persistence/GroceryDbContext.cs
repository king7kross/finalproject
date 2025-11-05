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
        // DbSet<ProductReview> Reviews => Set<ProductReview>(); // (bonus later)

        protected override void OnModelCreating(ModelBuilder b)
        {
            base.OnModelCreating(b);

            // Users: unique email (spec requires unique email) :contentReference[oaicite:16]{index=16}
            b.Entity<ApplicationUser>()
             .HasIndex(u => u.Email)
             .IsUnique();

            // Product field constraints already via DataAnnotations; add price precision:
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

            // Cart relationships
            b.Entity<Cart>()
             .HasMany(c => c.Items)
             .WithOne(i => i.Cart!)
             .HasForeignKey(i => i.CartId)
             .OnDelete(DeleteBehavior.Cascade);

            // Order relationships
            b.Entity<Order>()
             .HasMany(o => o.Items)
             .WithOne(i => i.Order!)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            // Unique order number for user display :contentReference[oaicite:17]{index=17}
            b.Entity<Order>()
             .HasIndex(o => o.OrderNumber)
             .IsUnique();
        }
    }
}
