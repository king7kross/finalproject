using System.ComponentModel.DataAnnotations;

namespace GroceryStore.Application.Models
{
    public class SignupRequest
    {
        // Full Name: Max 50,
        [Required(ErrorMessage = "Full name is required.")]
        [MaxLength(50)]
        public string FullName { get; set; } = default!;

        // Unique + valid email 
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Enter a valid email address.")]
        public string Email { get; set; } = default!;

        // Password rules handled by Identity options and FluentValidation later
        [Required(ErrorMessage = "Password is required.")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
        public string Password { get; set; } = default!;

        [Required(ErrorMessage = "Confirm Password is required.")]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; } = default!;
        // Phone: 10 digits 
        [Required(ErrorMessage = "PhoneNumber is required.")]
        [MaxLength(10)]
        public string PhoneNumber { get; set; } = default!;
    }
}
