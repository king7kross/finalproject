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
            // Check if passwords match before proceeding
            if (req.Password != req.ConfirmPassword)
                return BadRequest(new { message = "Passwords do not match." });

            // Verify if email is already used
            var existing = await _userManager.FindByEmailAsync(req.Email);
            if (existing != null)
                return BadRequest(new { message = "Email already registered." });

            // Create a new user instance
            var user = new ApplicationUser
            {
                UserName = req.Email,
                Email = req.Email,
                PhoneNumber = req.PhoneNumber,
                IsAdmin = false,
                FullName = req.FullName
            };

            // Save user details to the database
            var result = await _userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

            // Add claims for authorization purposes
            await _userManager.AddClaimsAsync(user, new[]
            {
                new Claim("is_admin", user.IsAdmin ? "true" : "false")
            });

            // Automatically sign in the new user
            await _signInManager.SignInAsync(user, isPersistent: false);

            return Ok(new { message = "Signup successful." });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest req)
        {
            // Find user by email
            var user = await _userManager.FindByEmailAsync(req.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials." });

            // Validate the password
            var result = await _signInManager.PasswordSignInAsync(user, req.Password, isPersistent: false, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Invalid credentials." });

            // Ensure the user has admin claim if needed
            var claims = await _userManager.GetClaimsAsync(user);
            if (!claims.Any(c => c.Type == "is_admin"))
                await _userManager.AddClaimAsync(user, new Claim("is_admin", user.IsAdmin ? "true" : "false"));

            // Refresh session
            await _signInManager.RefreshSignInAsync(user);

            // Return basic user info
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
            // Sign out the current user
            await _signInManager.SignOutAsync();
            return Ok(new { message = "Logged out." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponse>> Me()
        {
            // Retrieve the logged-in user's details
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Get extra claims if needed
            var claims = await _userManager.GetClaimsAsync(user);
            var fullName = claims.FirstOrDefault(c => c.Type == "full_name")?.Value ?? "";

            // Return user information
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
