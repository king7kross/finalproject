// src/app/features/catalog/product-detail/product-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../shared/models/product.models';
import { CommonModule, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgFor, CurrencyPipe, FormsModule],
  template: `
    <a routerLink="/" style="display:inline-block; margin-bottom:12px;">← Back</a>

    <section *ngIf="loading">Loading...</section>
    <section *ngIf="!loading && !product">Product not found.</section>

    <section *ngIf="product" style="display:grid; gap:16px; grid-template-columns: 1fr 1.5fr;">
      <div style="background:#fafafa; border:1px solid #eee; border-radius:8px; min-height:260px; display:flex; align-items:center; justify-content:center;">
        <img *ngIf="product!.imageUrl" [src]="product!.imageUrl!" alt="{{product!.name}}" style="max-width:100%; max-height:240px;">
        <span *ngIf="!product!.imageUrl" style="color:#888;">No Image</span>
      </div>

      <div>
        <h2 style="margin:0 0 8px 0;">{{ product!.name }}</h2>
        <div style="color:#666; margin-bottom:8px;">Category: {{ product!.category }}</div>
        <p style="margin-top:0;">{{ product!.description }}</p>

        <div style="display:flex; align-items:baseline; gap:8px; margin:12px 0;">
          <span style="font-size:18px;">{{ product!.price | currency:'INR':'symbol' }}</span>
          <span *ngIf="product!.discount && product!.discount! > 0" style="font-size:13px; color:#0a7;">
            -{{ product!.discount | currency:'INR':'symbol' }}
          </span>
        </div>

        <div *ngIf="product!.availableQuantity > 0; else out" style="display:flex; gap:8px; align-items:center; margin-top:8px;">
          <label for="qty">Qty:</label>
          <select id="qty" [(ngModel)]="qty" style="padding:6px;">
            <option *ngFor="let n of qtyOptions" [value]="n">{{ n }}</option>
          </select>
          <button (click)="addToCart()" style="padding:6px 10px;">Add to Cart</button>
        </div>

        <ng-template #out>
          <div style="margin-top:8px; color:#c00; font-weight:600;">Out of Stock</div>
        </ng-template>
      </div>
    </section>
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  qty = 1;
  qtyOptions: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private productsSvc: ProductsService,
    private cartSvc: CartService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loading = true;

    this.productsSvc.getProduct(id).subscribe({
      next: p => {
        this.product = p;
        this.loading = false;
        const max = Math.min(10, Math.max(0, p.availableQuantity));
        this.qtyOptions = Array.from({ length: max }, (_, i) => i + 1);
        if (this.qtyOptions.length === 0) this.qty = 0; else this.qty = 1;
      },
      error: _ => {
        this.product = null;
        this.loading = false;
      }
    });
  }

  addToCart(): void {
    if (!this.product) return;
    if (this.product.availableQuantity <= 0) return;
    if (this.qty <= 0) return;

    this.cartSvc.addItem(this.product.id, this.qty).subscribe({
      next: () => alert('Added to cart'), // simple message; toasts later
      error: (err) => {
        console.error(err);
        alert('Could not add to cart. Please login or try again.');
      }
    });
  }
}
