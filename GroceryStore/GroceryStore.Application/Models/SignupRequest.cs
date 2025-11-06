namespace GroceryStore.Application.Models
{
    public class SignupRequest
    {
        // Full Name: Max 50,
        public string FullName { get; set; } = default!;
        // Unique + valid email 
        public string Email { get; set; } = default!;
        // Password rules handled by Identity options + FluentValidation later
        public string Password { get; set; } = default!;
        public string ConfirmPassword { get; set; } = default!;
        // Phone: 10 digits 
        public string PhoneNumber { get; set; } = default!;
    }
}
