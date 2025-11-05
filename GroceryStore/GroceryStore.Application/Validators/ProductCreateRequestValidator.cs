using FluentValidation;
using GroceryStore.Application.Models;

namespace GroceryStore.Application.Validators
{
    public class ProductCreateRequestValidator : AbstractValidator<ProductCreateRequest>
    {
        public ProductCreateRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
            RuleFor(x => x.AvailableQuantity).NotNull(); // numeric, required
            RuleFor(x => x.Price).NotNull();             // decimal, required
            RuleFor(x => x.Discount).NotNull().When(x => x.Discount.HasValue == true); // optional
            RuleFor(x => x.Specification).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Specification));

            // Simple jpg/png check (server-side). UI will also validate later.
            RuleFor(x => x.ImageUrl)
                .NotEmpty()
                .Must(url => url.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
                          || url.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)
                          || url.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Image must be JPG or PNG.");
        }
    }
}
