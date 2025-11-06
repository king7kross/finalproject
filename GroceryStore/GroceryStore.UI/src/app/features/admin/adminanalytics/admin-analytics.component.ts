import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { TopProduct } from '../../../shared/models/admin.models';

@Component({
  standalone: true,
  selector: 'app-admin-analytics',
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  template: `
    <h2 style="margin:0 0 12px 0;">Top 5 Products (by Orders)</h2>

    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
      <label>Year:
        <select [(ngModel)]="year" (change)="fetch()">
          <option *ngFor="let y of years" [value]="y">{{ y }}</option>
        </select>
      </label>

      <label>Month:
        <select [(ngModel)]="month" (change)="fetch()">
          <option *ngFor="let m of months" [value]="m.value">{{ m.label }}</option>
        </select>
      </label>

      <button (click)="fetch()" [disabled]="loading">Refresh</button>
      <span *ngIf="loading">Loading...</span>
    </div>

    <div *ngIf="!loading && data.length === 0" style="color:#666;">No data for the selected period.</div>

    <table *ngIf="!loading && data.length > 0" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="text-align:left; border-bottom:1px solid #eee;">
          <th style="padding:8px;">#</th>
          <th style="padding:8px;">Product</th>
          <th style="padding:8px; text-align:right;">Total Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let row of data; let i = index" style="border-bottom:1px solid #f2f2f2;">
          <td style="padding:8px; width:56px;">{{ i + 1 }}</td>
          <td style="padding:8px;">{{ row.productName }}</td>
          <td style="padding:8px; text-align:right;">{{ row.totalQuantity }}</td>
        </tr>
      </tbody>
    </table>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  year!: number;
  month!: number; // 1..12
  years: number[] = [];
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  data: TopProduct[] = [];
  loading = false;

  constructor(private orders: OrdersService) { }

  ngOnInit(): void {
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1; // 1..12

    // last 6 years (adjust if you want)
    const latest = this.year;
    this.years = Array.from({ length: 6 }, (_, i) => latest - i);

    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.orders.getTopProducts(this.year, this.month, 5).subscribe({
      next: rows => { this.data = rows; this.loading = false; },
      error: _ => { this.data = []; this.loading = false; }
    });
  }
}
