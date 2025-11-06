using GroceryStore.Application.Models;
using GroceryStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GroceryStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpPost("signup")]
        [AllowAnonymous]
        public async Task<IActionResult> Signup([FromBody] SignupRequest req)
        {
            if (req.Password != req.ConfirmPassword)
                return BadRequest(new { message = "Passwords do not match." });

            var existing = await _userManager.FindByEmailAsync(req.Email);
            if (existing != null)
                return BadRequest(new { message = "Email already registered." });

            var user = new ApplicationUser
            {
                UserName = req.Email,
                Email = req.Email,
                PhoneNumber = req.PhoneNumber,
                IsAdmin = false,
                FullName = req.FullName
            };

            var result = await _userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            await _userManager.AddClaimsAsync(user, new[]
            {
                new Claim("is_admin", user.IsAdmin ? "true" : "false")
            });

            // ❌ Remove auto-login on signup
            // await _signInManager.SignInAsync(user, isPersistent: false);

            // ✅ Return simple success; client will redirect to /login
            return StatusCode(StatusCodes.Status201Created, new { message = "Signup successful. Please login." });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest req)
        {
            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials." });

            var result = await _signInManager.PasswordSignInAsync(user, req.Password, isPersistent: false, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Invalid credentials." });

            var claims = await _userManager.GetClaimsAsync(user);
            if (!claims.Any(c => c.Type == "is_admin"))
                await _userManager.AddClaimAsync(user, new Claim("is_admin", user.IsAdmin ? "true" : "false"));

            await _signInManager.RefreshSignInAsync(user);

            return new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber ?? "",
                IsAdmin = user.IsAdmin
            };
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> Me()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            return new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber ?? "",
                IsAdmin = user.IsAdmin
            };
        }
    }
}
