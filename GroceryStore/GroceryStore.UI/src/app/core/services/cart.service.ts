// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Cart } from '../../shared/models/cart.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private base = environment.apiBaseUrl + '/api/cart';

  constructor(private http: HttpClient) { }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.base);
  }

  addItem(productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.base}/items`, { productId, quantity });
  }

  updateItem(itemId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.base}/items/${itemId}`, { quantity });
  }

  removeItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/items/${itemId}`);
  }
}
