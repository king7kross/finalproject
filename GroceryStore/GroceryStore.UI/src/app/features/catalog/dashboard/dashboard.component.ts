// src/app/features/catalog/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ProductsService } from '../../../core/services/products.service';
import { Product, PagedResult } from '../../../shared/models/product.models';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, ProductCardComponent, PaginationComponent],
  template: `
    <section class="page">
      <div class="page-header">
        <h2 class="title">Products</h2>
        <div class="subtitle">Fresh picks, great deals — filter and sort quickly.</div>
      </div>

      <!-- Filters -->
      <section class="filters">
        <div class="filter-row">
          <div class="field">
            <span class="field-label">Search</span>
            <input class="input" [(ngModel)]="q" placeholder="Search products..." />
          </div>

          <div class="field">
            <span class="field-label">Category</span>
            <input class="input" [(ngModel)]="category" placeholder="e.g. Fruits, Snacks" />
          </div>

          <div class="field">
            <span class="field-label">Sort</span>
            <select class="select" [(ngModel)]="sortBy">
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>
          </div>

          <label class="check">
            <input type="checkbox" [(ngModel)]="desc" />
            <span>Descending</span>
          </label>

          <div class="field small">
            <span class="field-label">Page size</span>
            <select class="select" [(ngModel)]="pageSize">
              <option [value]="3">3</option>
              <option [value]="6">6</option>
              <option [value]="12">12</option>
              <option [value]="24">24</option>
            </select>
          </div>

          <div class="actions">
            <button class="btn btn-primary" (click)="apply()">Apply</button>
            <button class="btn btn-ghost" (click)="clear()">Clear</button>
          </div>
        </div>
      </section>

      <!-- Results -->
      <section *ngIf="loading" class="state">
        <span class="dot"></span> Loading...
      </section>

      <section *ngIf="!loading && products?.items?.length === 0" class="state muted">
        No products found.
      </section>

      <section *ngIf="!loading && products?.items?.length" class="results">
        <div class="grid">
          <gs-product-card *ngFor="let p of products!.items" [product]="p"></gs-product-card>
        </div>

        <div class="pagination-wrap">
          <gs-pagination
            [page]="page"
            [pageSize]="pageSize"
            [totalCount]="products!.totalCount"
            (pageChange)="onPage($event)">
          </gs-pagination>
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      color: #111827;
    }

    .page {
      padding: 14px 0;
    }

    .page-header {
      margin-bottom: 12px;
    }

    .title {
      margin: 0;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.2px;
    }

    .subtitle {
      margin-top: 4px;
      color: #6b7280;
      font-weight: 600;
      font-size: 13px;
    }

    /* Filters card */
    .filters {
      margin-bottom: 12px;
    }

    .filter-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: end;
      padding: 12px;
      border: 1px solid #eef2f7;
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 200px;
      flex: 1;
    }

    .field.small {
      min-width: 140px;
      flex: 0;
    }

    .field-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .input, .select {
      height: 40px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: #fbfdff;
      padding: 0 12px;
      font-size: 14px;
      color: #111827;
      outline: none;
      transition: box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
    }

    .input:focus, .select:focus {
      border-color: #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
      background: #ffffff;
    }

    .check {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid #e5e7eb;
      background: #ffffff;
      font-weight: 800;
      color: #374151;
      user-select: none;
    }

    .check input {
      width: 16px;
      height: 16px;
      accent-color: #1faa59;
    }

    .actions {
      display: flex;
      gap: 10px;
      align-items: center;
      flex: 0;
    }

    /* Buttons */
    .btn {
      height: 40px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid transparent;
      font-weight: 900;
      cursor: pointer;
      user-select: none;
      transition: transform 120ms ease, box-shadow 160ms ease, background 160ms ease, opacity 160ms ease;
    }

    .btn:active { transform: translateY(1px); }

    .btn-primary {
      background: #1faa59;
      color: #ffffff;
      box-shadow: 0 12px 22px rgba(31, 170, 89, 0.18);
    }

    .btn-primary:hover {
      box-shadow: 0 16px 28px rgba(31, 170, 89, 0.24);
    }

    .btn-ghost {
      background: #ffffff;
      color: #1faa59;
      border-color: rgba(31, 170, 89, 0.25);
    }

    .btn-ghost:hover {
      background: rgba(31, 170, 89, 0.08);
    }

    /* States */
    .state {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 12px;
      border: 1px dashed #e5e7eb;
      background: #fafafa;
      color: #374151;
      font-weight: 700;
    }

    .state.muted {
      color: #6b7280;
      font-weight: 650;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #1faa59;
      box-shadow: 0 0 0 3px rgba(31, 170, 89, 0.18);
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.35); opacity: 0.55; }
    }

    /* Results */
    .results {
      margin-top: 12px;
    }

    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }

    .pagination-wrap {
      margin-top: 14px;
      padding: 12px;
      border-radius: 16px;
      border: 1px solid #eef2f7;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
    }
  `]
})
export class DashboardComponent implements OnInit {
  products: PagedResult<Product> | null = null;
  loading = false;

  // query state
  page = 1;
  pageSize = 12;
  sortBy: 'name' | 'price' = 'name';
  desc = false;
  category = '';
  q = '';

  constructor(private productsSvc: ProductsService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.productsSvc.getProducts({
      page: this.page,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      desc: this.desc,
      category: this.category || undefined,
      q: this.q || undefined
    }).subscribe({
      next: res => {
        this.products = res;
        this.loading = false;
      },
      error: _ => {
        this.products = { items: [], page: this.page, pageSize: this.pageSize, totalCount: 0 };
        this.loading = false;
      }
    });
  }

  onPage(p: number) {
    this.page = p;
    this.load();
  }

  apply() {
    this.page = 1; // reset to first page when filters change
    this.load();
  }

  clear() {
    this.q = '';
    this.category = '';
    this.sortBy = 'name';
    this.desc = false;
    this.page = 1;
    this.pageSize = 12;
    this.load();
  }
}
