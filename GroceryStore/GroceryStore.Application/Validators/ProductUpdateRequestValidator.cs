using FluentValidation;
using GroceryStore.Application.Models;

namespace GroceryStore.Application.Validators
{
    public class ProductUpdateRequestValidator : AbstractValidator<ProductUpdateRequest>
    {
        public ProductUpdateRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Description).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
            RuleFor(x => x.AvailableQuantity).NotNull();
            RuleFor(x => x.Price).NotNull();
            RuleFor(x => x.Specification).MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Specification));
            RuleFor(x => x.ImageUrl)
                .NotEmpty()
                .Must(url => url.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
                          || url.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)
                          || url.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Image must be JPG or PNG.");
        }
    }
}
