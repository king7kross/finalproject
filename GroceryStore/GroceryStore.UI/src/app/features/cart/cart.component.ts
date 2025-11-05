// src/app/features/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { Cart, CartItem } from '../../shared/models/cart.models';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, FormsModule],
  template: `
    <h2>Cart</h2>

    <section *ngIf="loading">Loading...</section>

    <section *ngIf="!loading && (!cart || cart.items.length === 0)" style="padding:12px; border:1px dashed #ccc;">
      <strong>No Items in Cart</strong>
    </section>

    <section *ngIf="!loading && cart && cart.items.length > 0">
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="text-align:left; border-bottom:1px solid #eee;">
            <th style="padding:8px;">Product</th>
            <th style="padding:8px;">Price</th>
            <th style="padding:8px;">Discount</th>
            <th style="padding:8px;">Qty</th>
            <th style="padding:8px;">Subtotal</th>
            <th style="padding:8px;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let it of cart!.items" style="border-bottom:1px solid #f2f2f2;">
            <td style="padding:8px;">
              <div style="display:flex; gap:8px; align-items:center;">
                <img *ngIf="it.productImageUrl" [src]="it.productImageUrl" alt="" style="width:48px; height:48px; object-fit:cover; border:1px solid #eee;">
                <div>
                  <div style="font-weight:600;">{{ it.productName }}</div>
                  <div style="font-size:12px; color:#888;">Available: {{ it.availableQuantity }}</div>
                </div>
              </div>
            </td>
            <td style="padding:8px;">{{ it.price | currency:'INR':'symbol' }}</td>
            <td style="padding:8px;">{{ (it.discount || 0) | currency:'INR':'symbol' }}</td>
            <td style="padding:8px; white-space:nowrap;">
              <select [(ngModel)]="it.quantity" (ngModelChange)="onQtyChange(it)" [disabled]="updatingId === it.id">
                <option *ngFor="let n of qtyOptions(it)" [value]="n">{{ n }}</option>
              </select>
            </td>
            <td style="padding:8px;">
              {{ (it.price - (it.discount || 0)) * it.quantity | currency:'INR':'symbol' }}
            </td>
            <td style="padding:8px;">
              <button (click)="remove(it)" [disabled]="updatingId === it.id">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;">
        <button (click)="placeOrder()" [disabled]="placing">Place Order</button>
      </div>
    </section>
  `
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  updatingId: number | null = null;
  placing = false;

  constructor(private cartSvc: CartService, private ordersSvc: OrdersService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.cartSvc.getCart().subscribe({
      next: c => { this.cart = c; this.loading = false; },
      error: _ => { this.cart = { items: [], total: 0 }; this.loading = false; }
    });
  }

  qtyOptions(it: CartItem) {
    const max = Math.min(10, it.availableQuantity);
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  onQtyChange(it: CartItem) {
    this.updatingId = it.id;
    this.cartSvc.updateItem(it.id, it.quantity).subscribe({
      next: () => { this.updatingId = null; this.load(); },
      error: _ => { this.updatingId = null; alert('Could not update quantity (maybe out of stock).'); this.load(); }
    });
  }

  remove(it: CartItem) {
    this.updatingId = it.id;
    this.cartSvc.removeItem(it.id).subscribe({
      next: () => { this.updatingId = null; this.load(); },
      error: _ => { this.updatingId = null; alert('Failed to remove item.'); }
    });
  }

  placeOrder() {
    this.placing = true;
    this.ordersSvc.placeOrder().subscribe({
      next: res => {
        this.placing = false;
        alert(`Order placed! Order Number: ${res.orderNumber}`);
        this.load(); // cart should be cleared by server
      },
      error: err => {
        this.placing = false;
        console.error('Order placement error:', err);
        alert('Failed to place order. Please try again.');
      }
    });
  }
}
