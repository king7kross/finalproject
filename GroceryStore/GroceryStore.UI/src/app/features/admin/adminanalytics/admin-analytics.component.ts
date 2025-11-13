import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { TopProduct } from '../../../shared/models/admin.models';

@Component({
  standalone: true,
  selector: 'app-admin-analytics',
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './admin-analytics.component.html'
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
