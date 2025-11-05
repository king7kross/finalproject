// src/app/core/services/orders.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { OrderDto } from '../../shared/models/order.models';

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
}
