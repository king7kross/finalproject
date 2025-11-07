// src/app/features/admin/products-list/admin-products-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../core/services/products.service';
import { Product, PagedResult } from '../../../shared/models/product.models';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, RouterLink],
  templateUrl: './admin-products-list.component.html'
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
    // load all products without pagination
    this.productsSvc.getProducts({ page: 1, pageSize: 1000, sortBy: 'name' }).subscribe({
      next: res => { this.list = res; this.loading = false; },
      error: _ => { this.list = { items: [], page: 1, pageSize: 1000, totalCount: 0 }; this.loading = false; }
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
