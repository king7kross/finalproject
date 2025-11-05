namespace GroceryStore.Application.Models
{
    public class UserResponse
    {
        public string Id { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;
        public bool IsAdmin { get; set; }
    }
}
