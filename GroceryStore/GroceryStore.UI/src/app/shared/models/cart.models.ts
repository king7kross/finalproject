// src/app/shared/models/cart.models.ts
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  unitPrice: number;
  discount?: number | null;
  quantity: number;
  availableQuantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number; // (optional convenience, server may or may not send)
}
