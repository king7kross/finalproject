// src/app/features/admin/product-form/admin-product-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Product } from '../../../shared/models/product.models';


// Custom Validators 

// Short alias for maxLength validator (string input)
function maxLen(n: number) { return Validators.maxLength(n); }

// Validates: required + non-negative number
function nonNegNum(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return { required: true };
  const v = Number(raw);
  if (Number.isNaN(v) || v < 0) return { nonNegative: true };
  return null;
}

// Validates: required + integer
function integerOnly(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return { required: true };
  return /^\d+$/.test(raw) ? null : { integer: true };
}

// Validates: decimal with max 2 digits (optional field)
function decimal2(c: AbstractControl): ValidationErrors | null {
  const raw = (c.value ?? '').toString().trim();
  if (raw === '') return null; // optional — no required check here
  return /^\d+(\.\d{1,2})?$/.test(raw) ? null : { decimal2: true };
}

// Validates: non-negative + max 2 decimal places (optional)
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
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.css'
})
export class AdminProductFormComponent implements OnInit {

  // Whether editing an existing product
  isEdit = false;

  // Disable button + show spinner state
  submitting = false;

  // Product ID for edit mode
  currentId: number | null = null;

  // Image preview
  preview: string | null = null;

  // Main reactive form
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productsSvc: ProductsService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    // Build form immediately (constructor ensures fb is available)
    this.form = this.fb.group({

      // All inputs treated as strings → converted later in buildProductData()
      name: ['', [Validators.required, maxLen(100)]],
      description: ['', [Validators.required, maxLen(255)]],
      category: ['', [Validators.required, maxLen(100)]],

      // Quantity must be integer and non-negative
      availableQuantity: ['0', [integerOnly, nonNegNum]],

      // Price must be required + valid decimal
      price: ['', [Validators.required, decimal2, nonNegDecimal2]],

      // Optional decimal field
      discount: [''],

      // Optional short text
      specification: ['', [maxLen(100)]],

      // Simple URL + image extension check
      imageUrl: ['', [
        Validators.required,
        Validators.pattern(/https?:\/\/.*\.(jpg|jpeg|png)$/i)
      ]]
    });
  }

  // Shortcut helper for template bindings
  get f() { return this.form.controls as any; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // If ID exists → editing mode
    if (id) {
      this.isEdit = true;
      this.currentId = Number(id);

      // Load product and populate form
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

          // Set preview image
          this.preview = (p.imageUrl ?? null) as string | null;
        },
        error: _ => alert('Failed to load product.')
      });
    }
  }

  // Convert string-based form model → backend data model
  // Convert string-based form model → backend data model
  buildProductData(): any {
    const v = this.form.value as Record<string, any>;

    const discountRaw = v['discount'];
    const discountStr =
      discountRaw == null ? '' : String(discountRaw).trim();

    return {
      name: (v['name'] ?? '').toString(),
      description: (v['description'] ?? '').toString(),
      category: (v['category'] ?? '').toString(),
      availableQuantity: parseInt(v['availableQuantity'] ?? '0', 10),
      price: parseFloat(v['price'] ?? '0'),

      // discount/specification optional
      discount: discountStr === '' ? null : parseFloat(discountStr),

      specification:
        v['specification'] == null ||
          String(v['specification']).trim() === ''
          ? null
          : String(v['specification']),

      imageUrl: (v['imageUrl'] ?? '').toString()
    };
  }


  // Create or update product
  onSubmit() {
    if (this.form.invalid) return;

    this.submitting = true;
    const productData = this.buildProductData();

    if (this.isEdit && this.currentId) {
      // Update existing product
      this.productsSvc.updateProduct(this.currentId, productData).subscribe({
        next: () => {
          this.submitting = false;
          alert('Saved.');
          this.router.navigateByUrl('/admin');
        },
        error: _ => {
          this.submitting = false;
          alert('Save failed.');
        }
      });
    } else {
      // Create new product
      this.productsSvc.createProduct(productData).subscribe({
        next: () => {
          this.submitting = false;
          alert('Created.');
          this.router.navigateByUrl('/admin');
        },
        error: _ => {
          this.submitting = false;
          alert('Create failed.');
        }
      });
    }
  }
}
