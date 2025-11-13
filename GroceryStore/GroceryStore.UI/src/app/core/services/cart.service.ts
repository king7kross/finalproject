// src/app/core/services/cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Cart } from '../../shared/models/cart.models';

@Injectable({ providedIn: 'root' })
export class CartService {

  // Base URL for all cart-related API requests
  private base = environment.apiBaseUrl + '/api/cart';

  constructor(private http: HttpClient) { }

  // Fetch the current cart of the logged-in user
  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.base);
  }

  // Add a product to the cart
  addItem(productId: number, quantity: number): Observable<void> {
    return this.http.post<void>(`${this.base}/items`, { productId, quantity });
  }

  // Update the quantity of an existing cart item
  updateItem(itemId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.base}/items/${itemId}`, { quantity });
  }

  // Remove an item from the cart
  removeItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/items/${itemId}`);
  }
}
