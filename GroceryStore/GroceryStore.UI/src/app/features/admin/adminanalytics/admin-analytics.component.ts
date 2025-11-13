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

  // Selected year and month
  year!: number;
  month!: number; // 1..12

  // Dropdown options
  years: number[] = [];
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  // Data returned from API
  data: TopProduct[] = [];

  // Loading spinner control
  loading = false;

  constructor(private orders: OrdersService) { }

  ngOnInit(): void {
    const now = new Date();

    // Initialize with current year & month
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1; // JS months are 0..11

    // Build last 6 years for dropdown
    const latest = this.year;
    this.years = Array.from({ length: 6 }, (_, i) => latest - i);

    // Load data initially
    this.fetch();
  }

  fetch(): void {
    this.loading = true;

    // Call service to fetch top 5 products for selected month/year
    this.orders.getTopProducts(this.year, this.month, 5).subscribe({
      next: rows => {
        this.data = rows;
        this.loading = false;
      },
      error: () => {
        this.data = [];
        this.loading = false;
      }
    });
  }
}
