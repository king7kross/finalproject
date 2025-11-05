// Program.cs (GroceryStore.API) — .NET 8

using System.Security.Claims;
using FluentValidation;
using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Validators; // for typeof(ProductCreateRequestValidator)
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Logging;
using GroceryStore.Infrastructure.Persistence;
using GroceryStore.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// CORS (Angular dev host). Adjust origins if your port/host differs.
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("Frontend", p =>
        p.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:64138")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});

// MVC + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------------------------------------------------
// Connection string guard (simple and explicit)
var cs = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(cs))
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing/empty. " +
        "Add it to GroceryStore.API/appsettings*.json under ConnectionStrings.");

// DbContext + EF console interceptor
builder.Services.AddDbContext<GroceryDbContext>(options =>
{
    options.UseSqlServer(cs);
    options.AddInterceptors(new ConsoleCommandInterceptor());
});

// ------------------------------------------------------------
// Identity (cookie auth only; NO JWT)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    // Password: min 8, at least 1 special, 1 number, 1 alphabet (lowercase ok)
    opts.Password.RequiredLength = 8;
    opts.Password.RequireNonAlphanumeric = true; // special char
    opts.Password.RequireDigit = true;           // number
    opts.Password.RequireLowercase = true;       // alphabet
    opts.Password.RequireUppercase = false;      // not required by spec

    // Email must be unique
    opts.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GroceryDbContext>()
.AddDefaultTokenProviders();

// Cookie settings for an API (no redirects)
builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.Name = "GroceryStore.Auth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.None;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.SlidingExpiration = true;
    o.Events = new Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; },
        OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; }
    };
});

// Authorization policy for admins via claim added at signup/login
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("is_admin", "true"));
});

// ------------------------------------------------------------
// FluentValidation (no FluentValidation.AspNetCore)
// Register validators from Application assembly and call them manually in controllers.
builder.Services.AddValidatorsFromAssembly(typeof(ProductCreateRequestValidator).Assembly);

// ------------------------------------------------------------
// Repositories (simple, non-generic)
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// ------------------------------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ------------------------------------------------------------
// Seed DB (simple, no migrations): creates DB if missing and seeds admin/products
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await SeedData.InitializeAsync(services); // EnsureCreatedAsync inside SeedData
}

app.Run();
