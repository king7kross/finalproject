// src/app/shared/models/product.models.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;            // decimal(18,2) on server
  discount?: number | null; // decimal(18,2) optional
  imageUrl?: string | null;
  availableQuantity: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}
