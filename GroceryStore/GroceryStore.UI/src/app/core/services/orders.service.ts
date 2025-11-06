import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OrderDto } from '../../shared/models/order.models';
import { TopProduct } from '../../shared/models/admin.models'; // 👈 add this import

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = environment.apiBaseUrl + '/api/orders';

  constructor(private http: HttpClient) { }

  placeOrder(): Observable<{ orderNumber: string }> {
    return this.http.post<{ orderNumber: string }>(`${this.base}/place`, {});
  }

  myOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.base}/my`);
  }

  // 👇 NEW: Admin analytics
  getTopProducts(year?: number, month?: number, top: number = 5): Observable<TopProduct[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', String(year));
    if (month) params = params.set('month', String(month));
    if (top) params = params.set('top', String(top));
    return this.http.get<TopProduct[]>(`${this.base}/analytics/top-products`, { params });
  }
}
