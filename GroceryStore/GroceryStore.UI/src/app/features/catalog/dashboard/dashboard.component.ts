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
    <h2>Products</h2>

    <!-- Filters -->
    <section style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
      <input [(ngModel)]="q" placeholder="Search..." style="padding:6px; min-width:180px;">
      <input [(ngModel)]="category" placeholder="Category" style="padding:6px; min-width:140px;">
      <select [(ngModel)]="sortBy" style="padding:6px;">
        <option value="name">Sort: Name</option>
        <option value="price">Sort: Price</option>
      </select>
      <label style="display:flex; align-items:center; gap:6px;">
        <input type="checkbox" [(ngModel)]="desc"> Desc
      </label>
      <select [(ngModel)]="pageSize" style="padding:6px;">
        <option [value]="3">3</option>
        <option [value]="6">6</option>
        <option [value]="12">12</option>
        <option [value]="24">24</option>
      </select>
      <button (click)="apply()" style="padding:6px 10px;">Apply</button>
      <button (click)="clear()" style="padding:6px 10px;">Clear</button>
    </section>

    <!-- Results -->
    <section *ngIf="loading">Loading...</section>
    <section *ngIf="!loading && products?.items?.length === 0">No products found.</section>

    <section *ngIf="!loading && products?.items?.length">
      <div style="display:grid; gap:12px; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));">
        <gs-product-card *ngFor="let p of products!.items" [product]="p"></gs-product-card>
      </div>

      <gs-pagination
        [page]="page"
        [pageSize]="pageSize"
        [totalCount]="products!.totalCount"
        (pageChange)="onPage($event)">
      </gs-pagination>
    </section>
  `
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
