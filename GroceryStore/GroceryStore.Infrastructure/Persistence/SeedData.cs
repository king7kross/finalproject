using GroceryStore.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace GroceryStore.Infrastructure.Persistence
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider services)
        {
            var ctx = services.GetRequiredService<GroceryDbContext>();
            await ctx.Database.EnsureCreatedAsync();
                                                    

            // Create admin user(s)
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var adminEmail = "admin@example.com";
            var admin = await userManager.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);

            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    IsAdmin = true,
                    FullName = "Administrator"  
                };
                // Simple strong password to match password rules (we’ll validate at API later) :contentReference[oaicite:21]{index=21}
                await userManager.CreateAsync(admin, "Admin@1234");
            }

            // Seed a few products if none exist
            if (!await ctx.Products.AnyAsync())
            {
                ctx.Products.AddRange(
                    new Product
                    {
                        Name = "Basmati Rice 5kg",
                        Description = "Premium basmati rice.",
                        Category = "Grains",
                        AvailableQuantity = 50,
                        ImageUrl = "/images/rice.jpg",
                        Price = 799.00m,
                        Discount = 50m,
                        Specification = "5kg"
                    },
                    new Product
                    {
                        Name = "Whole Wheat Flour 5kg",
                        Description = "Stone-ground whole wheat flour.",
                        Category = "Flour",
                        AvailableQuantity = 0, 
                        ImageUrl = "/images/atta.jpg",
                        Price = 349.00m
                    }
                );
                await ctx.SaveChangesAsync();
            }
        }
    }
}
