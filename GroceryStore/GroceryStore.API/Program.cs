// Program.cs (GroceryStore.API) — .NET 8

using FluentValidation;
using GroceryStore.Application.Interfaces;
using GroceryStore.Application.Validators; 
using GroceryStore.Domain.Entities;
using GroceryStore.Infrastructure.Logging;
using GroceryStore.Infrastructure.Persistence;
using GroceryStore.Infrastructure.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// cors allow the angular to host the api
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:55568")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();           


// Connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<GroceryDbContext>(options =>
{
    options.UseSqlServer(connectionString, sql => sql.MigrationsAssembly("GroceryStore.Infrastructure"));
    options.AddInterceptors(new ConsoleCommandInterceptor());
});


// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(opts =>
{
    // password rules 
    opts.Password.RequiredLength = 8;
    opts.Password.RequireNonAlphanumeric = true; // needs a special char
    opts.Password.RequireDigit = true;           // needs a number
    opts.Password.RequireLowercase = true;       // needs a lowercase letter
    opts.Password.RequireUppercase = true;      // uppercase not required

    // each email can register only once
    opts.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GroceryDbContext>();

// Cookie options for APIs 
builder.Services.ConfigureApplicationCookie(opts =>
{
    opts.Cookie.Name = "GroceryStore.Auth";
    opts.Cookie.HttpOnly = true;
    opts.Cookie.SameSite = SameSiteMode.None;                 // works with frontend on another origin
    opts.Cookie.SecurePolicy = CookieSecurePolicy.Always;     // HTTPS only
    opts.SlidingExpiration = true;
    opts.Events = new Microsoft.AspNetCore.Authentication.Cookies.CookieAuthenticationEvents
    {
        OnRedirectToLogin = i => { i.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; },
        OnRedirectToAccessDenied = i => { i.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; }
    };
});

// authorization policy only users with is_admin=true can access admin endpoints
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireClaim("is_admin", "true"));
});


// FluentValidation: register validators from Application and call in controllers
builder.Services.AddValidatorsFromAssembly(typeof(ProductCreateRequestValidator).Assembly);

// repositories  DI registrations 
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();


var app = builder.Build();


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

//  run migrations and seed initial data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GroceryDbContext>();
    await db.Database.MigrateAsync();                        
    await SeedData.InitializeAsync(scope.ServiceProvider);    
}

app.Run();
