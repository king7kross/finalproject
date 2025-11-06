export interface Review {
  id: number;
  productId: number;
  userId: string;
  userName?: string | null;
  rating: number;       // 1..5
  comment: string;
  createdAt: string;    // ISO
}

export interface CreateReviewRequest {
  rating: number;       // 1..5
  comment: string;
}
