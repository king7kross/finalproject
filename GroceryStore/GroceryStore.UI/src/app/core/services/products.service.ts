// src/app/core/services/products.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Product, PagedResult } from '../../shared/models/product.models';

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;  // e.g. 'name' | 'price'
  desc?: boolean;
  category?: string;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private base = environment.apiBaseUrl + '/api/products';

  constructor(private http: HttpClient) { }

  getProducts(query: ProductQuery): Observable<PagedResult<Product>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (typeof query.desc === 'boolean') params = params.set('desc', String(query.desc));
    if (query.category) params = params.set('category', query.category);
    if (query.q) params = params.set('q', query.q);

    return this.http.get<PagedResult<Product>>(this.base, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  // Admin endpoints
  createProduct(productData: any) {
    // expects JSON object matching ProductCreateRequest
    return this.http.post(`${this.base}`, productData);
  }

  updateProduct(id: number, productData: any) {
    return this.http.put(`${this.base}/${id}`, productData);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

}
