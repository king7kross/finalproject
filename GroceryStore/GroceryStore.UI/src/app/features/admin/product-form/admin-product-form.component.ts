// src/app/features/admin/product-form/admin-product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Product } from '../../../shared/models/product.models';


// Validators that work on string inputs (HTML inputs yield strings)
function maxLen(n: number) { return Validators.maxLength(n); }

function nonNegNum(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return { required: true };
  const v = Number(raw);
  if (Number.isNaN(v) || v < 0) return { nonNegative: true };
  return null;
}

function integerOnly(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return { required: true };
  return /^\d+$/.test(raw) ? null : { integer: true };
}

function decimal2(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return null; // optional field will add required if you need it
  return /^\d+(\.\d{1,2})?$/.test(raw) ? null : { decimal2: true };
}

function nonNegDecimal2(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return null;
  const v = Number(raw);
  if (Number.isNaN(v) || v < 0) return { nonNegative: true };
  return decimal2(c);
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './admin-product-form.component.html'
})
export class AdminProductFormComponent implements OnInit {
  isEdit = false;
  submitting = false;
  currentId: number | null = null;

  preview: string | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productsSvc: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // ✅ Create the form INSIDE constructor so fb is available
    this.form = this.fb.group({
      // treat inputs as strings; convert later
      name: ['', [Validators.required, maxLen(100)]],
      description: ['', [Validators.required, maxLen(255)]],
      category: ['', [Validators.required, maxLen(100)]],
      availableQuantity: ['0', [integerOnly, nonNegNum]],
      price: ['', [Validators.required, decimal2, nonNegDecimal2]],
      discount: [''], // optional, validated by decimal2/nonNegDecimal2 only if filled
      specification: ['', [maxLen(100)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/.*\.(jpg|jpeg|png)$/i)]]
    });
  }

  get f() { return this.form.controls as any; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.currentId = Number(id);
      this.productsSvc.getProduct(this.currentId).subscribe({
        next: (p: Product) => {
          this.form.patchValue({
            name: p.name ?? '',
            description: p.description ?? '',
            category: p.category ?? '',
            availableQuantity: String(p.availableQuantity ?? 0),
            price: String(p.price ?? ''),
            discount: p.discount == null ? '' : String(p.discount),
            specification: p.specification ?? '',
            imageUrl: p.imageUrl ?? ''
          });
          this.preview = (p.imageUrl ?? null) as string | null;
        },
        error: _ => alert('Failed to load product.')
      });
    }
  }

  buildProductData(): any {
    const v = this.form.value as Record<string, string>;

    return {
      name: (v['name'] ?? '').toString(),
      description: (v['description'] ?? '').toString(),
      category: (v['category'] ?? '').toString(),
      availableQuantity: parseInt((v['availableQuantity'] ?? '0').toString()),
      price: parseFloat((v['price'] ?? '0').toString()),
      discount: (v['discount'] ?? '').toString().trim() === '' ? null : parseFloat((v['discount'] ?? '0').toString()),
      specification: (v['specification'] ?? '').toString().trim() === '' ? null : (v['specification'] ?? '').toString(),
      imageUrl: (v['imageUrl'] ?? '').toString()
    };
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    const productData = this.buildProductData();

    if (this.isEdit && this.currentId) {
      this.productsSvc.updateProduct(this.currentId, productData).subscribe({
        next: () => { this.submitting = false; alert('Saved.'); this.router.navigateByUrl('/admin'); },
        error: _ => { this.submitting = false; alert('Save failed.'); }
      });
    } else {
      this.productsSvc.createProduct(productData).subscribe({
        next: () => { this.submitting = false; alert('Created.'); this.router.navigateByUrl('/admin'); },
        error: _ => { this.submitting = false; alert('Create failed.'); }
      });
    }
  }
}
