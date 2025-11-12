namespace GroceryStore.Application.Models
{
    public class ProductListQuery
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string? SortBy { get; set; } = "name";   
        public bool Desc { get; set; } = false;
        public string? Category { get; set; }
        public string? Q { get; set; }                  // search in name/description
    }
}
