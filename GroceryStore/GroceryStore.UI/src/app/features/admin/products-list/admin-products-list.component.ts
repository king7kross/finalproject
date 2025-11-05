// src/app/features/admin/products-list/admin-products-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products.service';
import { Product, PagedResult } from '../../../shared/models/product.models';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, RouterLink],
  template: `
    <h2>Admin - Products</h2>

    <div style="margin-bottom:12px;">
      <a routerLink="/admin/add">+ Add Product</a>
    </div>

    <section *ngIf="loading">Loading...</section>
    <section *ngIf="!loading && list?.items?.length === 0">No products.</section>

    <table *ngIf="!loading && list?.items?.length" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="text-align:left; border-bottom:1px solid #eee;">
          <th style="padding:8px;">Name</th>
          <th style="padding:8px;">Category</th>
          <th style="padding:8px;">Price</th>
          <th style="padding:8px;">Qty</th>
          <th style="padding:8px;">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of list!.items" style="border-bottom:1px solid #f2f2f2;">
          <td style="padding:8px;">{{ p.name }}</td>
          <td style="padding:8px;">{{ p.category }}</td>
          <td style="padding:8px;">{{ p.price | currency:'USD':'symbol' }}</td>
          <td style="padding:8px;">{{ p.availableQuantity }}</td>
          <td style="padding:8px;">
            <a [routerLink]="['/admin/edit', p.id]">Edit</a>
            &nbsp;|&nbsp;
            <a href="" (click)="onDelete(p.id); $event.preventDefault();">Delete</a>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class AdminProductsListComponent implements OnInit {
  list: PagedResult<Product> | null = null;
  loading = false;

  constructor(private productsSvc: ProductsService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    // reuse public endpoint with large page size for simplicity
    this.productsSvc.getProducts({ page: 1, pageSize: 100, sortBy: 'name' }).subscribe({
      next: res => { this.list = res; this.loading = false; },
      error: _ => { this.list = { items: [], page: 1, pageSize: 100, totalCount: 0 }; this.loading = false; }
    });
  }

  onDelete(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productsSvc.deleteProduct(id).subscribe({
      next: () => this.load(),
      error: _ => alert('Delete failed.')
    });
  }
}
