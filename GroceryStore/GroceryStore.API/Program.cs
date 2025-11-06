// Program.cs (GroceryStore.API) — .NET 8

using System.Security.Claims;
using FluentValidation;
using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Validators; // validators live in Application layer
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Logging;
using GroceryStore.Infrastructure.Persistence;
using GroceryStore.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// CORS: allow the Angular dev hosts to call this API
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("Frontend", p =>
        p.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:64138")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});

// MVC + Swagger for minimal API docs
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------------------------------------------------
// Connection string: fail fast if missing to avoid silent runtime errors
var cs = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(cs))
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing/empty. " +
        "Add it to GroceryStore.API/appsettings*.json under ConnectionStrings.");

// DbContext + EF interceptor (logs SQL to console for learning/debugging)
builder.Services.AddDbContext<GroceryDbContext>(options =>
{
    options.UseSqlServer(cs, sql => sql.MigrationsAssembly("GroceryStore.Infrastructure"));
    options.AddInterceptors(new ConsoleCommandInterceptor());
});

// ------------------------------------------------------------
// Identity: cookie-based auth (no JWT for this project)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    // password rules from spec
    opts.Password.RequiredLength = 8;
    opts.Password.RequireNonAlphanumeric = true; // needs a special char
    opts.Password.RequireDigit = true;           // needs a number
    opts.Password.RequireLowercase = true;       // needs a lowercase letter
    opts.Password.RequireUppercase = false;      // uppercase not required

    // each email can register only once
    opts.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GroceryDbContext>()
.AddDefaultTokenProviders();

// Cookie options tuned for APIs (return codes instead of redirects)
builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.Name = "GroceryStore.Auth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.None;                 // works with frontend on another origin
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;     // HTTPS only
    o.SlidingExpiration = true;
    o.Events = new Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; },
        OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; }
    };
});

// Authorization policy: only users with is_admin=true can access admin endpoints
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("is_admin", "true"));
});

// ------------------------------------------------------------
// FluentValidation: register validators from Application and call in controllers
builder.Services.AddValidatorsFromAssembly(typeof(ProductCreateRequestValidator).Assembly);

// ------------------------------------------------------------
// Repositories: simple DI registrations (non-generic approach)
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();


// ------------------------------------------------------------
var app = builder.Build();

// Swagger only in Development to keep production clean
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");          // apply the CORS policy
app.UseAuthentication();          // set HttpContext.User from cookie
app.UseAuthorization();           // check policies/attributes

app.MapControllers();             // map attribute-routed controllers

// ------------------------------------------------------------
// Seed: run migrations and seed initial data (admin + sample products)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GroceryDbContext>();
    await db.Database.MigrateAsync();                         // make sure DB schema is up to date
    await SeedData.InitializeAsync(scope.ServiceProvider);    // seed without EnsureCreated
}

app.Run();
