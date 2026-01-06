// src/app/features/orders/my-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../core/services/orders.service';
import { OrderDto } from '../../shared/models/order.models';
import { DatePipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, CurrencyPipe],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
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
