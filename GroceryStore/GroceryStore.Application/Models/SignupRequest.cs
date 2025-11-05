namespace GroceryStore.Application.Models
{
    public class SignupRequest
    {
        // Full Name: Max 50, alphabets only (validated next step) :contentReference[oaicite:7]{index=7}
        public string FullName { get; set; } = default!;
        // Unique + valid email :contentReference[oaicite:8]{index=8}
        public string Email { get; set; } = default!;
        // Password rules handled by Identity options + FluentValidation later :contentReference[oaicite:9]{index=9}
        public string Password { get; set; } = default!;
        public string ConfirmPassword { get; set; } = default!;
        // Phone: 10 digits (validated next step) :contentReference[oaicite:10]{index=10}
        public string PhoneNumber { get; set; } = default!;
    }
}
