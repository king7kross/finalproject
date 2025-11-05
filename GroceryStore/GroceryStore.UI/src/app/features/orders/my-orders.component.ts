// src/app/features/orders/my-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../core/services/orders.service';
import { OrderDto } from '../../shared/models/order.models';
import { DatePipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, CurrencyPipe],
  template: `
    <h2>My Orders</h2>

    <section *ngIf="loading">Loading...</section>
    <section *ngIf="!loading && orders.length === 0">No orders yet.</section>

    <section *ngIf="!loading && orders.length > 0" style="display:flex; flex-direction:column; gap:12px;">
      <article *ngFor="let o of orders" style="border:1px solid #eee; border-radius:8px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><strong>Order #{{ o.orderNumber }}</strong></div>
          <div style="font-size:12px; color:#666;">{{ o.createdAt | date:'medium' }}</div>
        </div>
        <ul style="margin:8px 0 0 16px;">
          <li *ngFor="let it of o.items">
            {{ it.productName }} × {{ it.quantity }} —
            {{ (it.unitPrice - (it.discountAtPurchase || 0)) | currency:'INR':'symbol' }}
          </li>
        </ul>
        <div style="margin-top:8px; text-align:right;">
          <strong>Total: {{ o.total | currency:'INR':'symbol' }}</strong>
        </div>
      </article>
    </section>
  `
})
export class MyOrdersComponent implements OnInit {
  orders: OrderDto[] = [];
  loading = false;

  constructor(private ordersSvc: OrdersService) { }

  ngOnInit(): void {
    this.loading = true;
    this.ordersSvc.myOrders().subscribe({
      next: list => { this.orders = list; this.loading = false; },
      error: _ => { this.orders = []; this.loading = false; }
    });
  }
}
