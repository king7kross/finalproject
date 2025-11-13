import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Product, PagedResult } from '../../shared/models/product.models';
import { Review, CreateReviewRequest } from '../../shared/models/review.models';

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;   // 'name' | 'price' | 'category'
  desc?: boolean;
  category?: string;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private base = environment.apiBaseUrl + '/api/products';

  constructor(private http: HttpClient) { }

  // Products
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

  // Admin services
  createProduct(productData: any) {
    return this.http.post(`${this.base}`, productData);
  }

  updateProduct(id: number, productData: any) {
    return this.http.put(`${this.base}/${id}`, productData);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  //  Reviews
  getReviews(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.base}/${productId}/reviews`);
  }

  addReview(productId: number, payload: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${productId}/reviews`, payload);
  }
}
