using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace GroceryStore.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public bool IsAdmin { get; set; }

        [Required]
        [MaxLength(50)]
        public string FullName { get; set; } = string.Empty; 
    }
}
