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
  templateUrl: './cart.component.html'
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
