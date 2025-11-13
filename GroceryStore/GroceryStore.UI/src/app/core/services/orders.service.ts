import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OrderDto } from '../../shared/models/order.models';
import { TopProduct } from '../../shared/models/admin.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {

  // Base URL for all order-related API requests
  private base = environment.apiBaseUrl + '/api/orders';

  constructor(private http: HttpClient) { }

  // Place a new order for the logged-in user
  placeOrder(): Observable<{ orderNumber: string }> {
    return this.http.post<{ orderNumber: string }>(`${this.base}/place`, {});
  }

  // Get all orders of the current user
  myOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.base}/my`);
  }

  // Admin analytics: fetch top-selling products
  getTopProducts(year?: number, month?: number, top: number = 5): Observable<TopProduct[]> {
    let params = new HttpParams();

    // Add optional filters to query params
    if (year) params = params.set('year', String(year));
    if (month) params = params.set('month', String(month));
    if (top) params = params.set('top', String(top));

    return this.http.get<TopProduct[]>(`${this.base}/analytics/top-products`, { params });
  }
}
