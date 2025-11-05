// src/app/shared/models/order.models.ts
export interface OrderItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  discountAtPurchase?: number | null;
  quantity: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string; // unique id returned by server
  createdAt: string;   // ISO
  items: OrderItemDto[];
  total: number;
}
