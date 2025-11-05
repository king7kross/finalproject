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
  template: `
    <h2>{{ isEdit ? 'Edit Product' : 'Add Product' }}</h2>
    <a routerLink="/admin">← Back</a>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" style="margin-top:12px; display:grid; gap:12px; max-width:560px;">
      <div>
        <label>Name</label><br>
        <input formControlName="name" />
        <div *ngIf="f.name.touched && f.name.errors" style="color:#c00; font-size:12px;">
          <div *ngIf="f.name.errors['required']">Name is required.</div>
          <div *ngIf="f.name.errors['maxlength']">Max 100 characters.</div>
        </div>
      </div>

      <div>
        <label>Description</label><br>
        <textarea formControlName="description" rows="3"></textarea>
        <div *ngIf="f.description.touched && f.description.errors" style="color:#c00; font-size:12px;">
          <div *ngIf="f.description.errors['required']">Description is required.</div>
          <div *ngIf="f.description.errors['maxlength']">Max 255 characters.</div>
        </div>
      </div>

      <div>
        <label>Category</label><br>
        <input formControlName="category" />
        <div *ngIf="f.category.touched && f.category.errors" style="color:#c00; font-size:12px;">
          <div *ngIf="f.category.errors['required']">Category is required.</div>
          <div *ngIf="f.category.errors['maxlength']">Max 100 characters.</div>
        </div>
      </div>

      <div>
        <label>Available Quantity</label><br>
        <input formControlName="availableQuantity" />
        <div *ngIf="f.availableQuantity.touched && f.availableQuantity.errors" style="color:#c00; font-size:12px;">
          <div *ngIf="f.availableQuantity.errors['required']">Quantity is required.</div>
          <div *ngIf="f.availableQuantity.errors['integer']">Must be a whole number.</div>
          <div *ngIf="f.availableQuantity.errors['nonNegative']">Must be ≥ 0.</div>
        </div>
      </div>

      <div>
        <label>Price</label><br>
        <input formControlName="price" />
        <div *ngIf="f.price.touched && f.price.errors" style="color:#c00; font-size:12px;">
          <div *ngIf="f.price.errors['required']">Price is required.</div>
          <div *ngIf="f.price.errors['decimal2']">Decimals up to 2 places.</div>
          <div *ngIf="f.price.errors['nonNegative']">Must be ≥ 0.</div>
        </div>
      </div>

      <div>
        <label>Discount (optional)</label><br>
        <input formControlName="discount" />
        <div *ngIf="f.discount.touched && f.discount.errors" style="color:#c00; font-size:12px;">
          <div *ngIf="f.discount.errors['decimal2']">Decimals up to 2 places.</div>
          <div *ngIf="f.discount.errors['nonNegative']">Must be ≥ 0.</div>
        </div>
      </div>

      <div>
        <label>Image (JPG/PNG)</label><br>
        <input type="file" (change)="onFile($event)" accept=".jpg,.jpeg,.png" />
        <div *ngIf="imageError" style="color:#c00; font-size:12px;">{{ imageError }}</div>
        <div *ngIf="preview" style="margin-top:6px;">
          <img [src]="preview" alt="" style="max-width:160px; border:1px solid #eee;">
        </div>
      </div>

      <div>
        <button [disabled]="submitting || form.invalid">{{ isEdit ? 'Save' : 'Create' }}</button>
      </div>
    </form>
  `
})
export class AdminProductFormComponent implements OnInit {
  isEdit = false;
  submitting = false;
  currentId: number | null = null;

  imageFile: File | null = null;
  imageError = '';
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
      discount: [''] // optional, validated by decimal2/nonNegDecimal2 only if filled
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
            discount: p.discount == null ? '' : String(p.discount)
          });
          this.preview = (p.imageUrl ?? null) as string | null;
        },
        error: _ => alert('Failed to load product.')
      });
    }
  }

  onFile(e: Event) {
    this.imageError = '';
    this.imageFile = null;
    this.preview = null;

    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!(name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png'))) {
      this.imageError = 'Only JPG or PNG allowed.';
      return;
    }

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = (reader.result as string) || null; // ✅ cast result to string
    };
    reader.readAsDataURL(file);
  }

  buildFormData(): FormData {
    const fd = new FormData();
    const v = this.form.value as Record<string, string>;

    fd.append('name', (v['name'] ?? '').toString());
    fd.append('description', (v['description'] ?? '').toString());
    fd.append('category', (v['category'] ?? '').toString());
    fd.append('availableQuantity', (v['availableQuantity'] ?? '0').toString());
    fd.append('price', (v['price'] ?? '0').toString());

    const discount = (v['discount'] ?? '').toString().trim();
    if (discount !== '') fd.append('discount', discount);

    if (this.imageFile) fd.append('image', this.imageFile);
    return fd;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;
    const fd = this.buildFormData();

    if (this.isEdit && this.currentId) {
      this.productsSvc.updateProduct(this.currentId, fd).subscribe({
        next: () => { this.submitting = false; alert('Saved.'); this.router.navigateByUrl('/admin'); },
        error: _ => { this.submitting = false; alert('Save failed.'); }
      });
    } else {
      this.productsSvc.createProduct(fd).subscribe({
        next: () => { this.submitting = false; alert('Created.'); this.router.navigateByUrl('/admin'); },
        error: _ => { this.submitting = false; alert('Create failed.'); }
      });
    }
  }
}
