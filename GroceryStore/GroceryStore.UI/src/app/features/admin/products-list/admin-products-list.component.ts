// src/app/features/admin/products-list/admin-products-list.component.ts

import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products.service';
import { Product, PagedResult } from '../../../shared/models/product.models';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, RouterLink],
  templateUrl: './admin-products-list.component.html',
  styleUrl: './admin-products-list.component.css'
})
export class AdminProductsListComponent implements OnInit {

  // Holds returned product list
  list: PagedResult<Product> | null = null;

  // Controls loading spinner
  loading = false;

  constructor(private productsSvc: ProductsService) { }

  ngOnInit(): void {
    // Load product list on page entry
    this.load();
  }

  load() {
    this.loading = true;

    // Fetch all products (large page size to simulate no pagination)
    this.productsSvc.getProducts({ page: 1, pageSize: 1000, sortBy: 'name' }).subscribe({
      next: res => {
        this.list = res;
        this.loading = false;
      },
      error: _ => {
        // In case of failure, return an empty list but keep structure
        this.list = { items: [], page: 1, pageSize: 1000, totalCount: 0 };
        this.loading = false;
      }
    });
  }

  onDelete(id: number) {
    if (!confirm('Delete this product?')) return;

    // Call delete API and reload the list after success
    this.productsSvc.deleteProduct(id).subscribe({
      next: () => this.load(),
      error: _ => alert('Delete failed.')
    });
  }
}
