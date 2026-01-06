import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../shared/models/product.models';
import { CommonModule, NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { Review, CreateReviewRequest } from '../../../shared/models/review.models';
import { UserStore } from '../../../core/state/user.store';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgFor, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <a routerLink="/" class="back-link">← Back</a>

    <section *ngIf="loading" class="state">
      <span class="dot"></span> Loading...
    </section>

    <section *ngIf="!loading && !product" class="state muted">
      Product not found.
    </section>

    <section *ngIf="product" class="layout">
      <!-- Image -->
      <div class="media">
        <img *ngIf="product!.imageUrl" [src]="product!.imageUrl!" alt="{{product!.name}}" class="media-img">
        <div *ngIf="!product!.imageUrl" class="media-empty">No Image</div>
      </div>

      <!-- Details -->
      <div class="details">
        <h2 class="name">{{ product!.name }}</h2>
        <div class="meta">
          <span class="chip">Category: {{ product!.category }}</span>
        </div>

        <p class="desc">{{ product!.description }}</p>

        <!-- Specifications -->
        <div *ngIf="specLines.length > 0" class="spec">
          <h3 class="section-title">Specifications</h3>
          <ul class="spec-list">
            <li *ngFor="let s of specLines">{{ s }}</li>
          </ul>
        </div>

        <!-- Price -->
        <div class="price-row">
          <span class="price">
            {{ (product!.price - (product!.discount || 0)) | currency:'INR':'symbol' }}
          </span>

          <span *ngIf="product!.discount && product!.discount! > 0" class="mrp">
            {{ product!.price | currency:'INR':'symbol' }}
          </span>

          <span *ngIf="product!.discount && product!.discount! > 0" class="badge">
            Save {{ (product!.discount || 0) | currency:'INR':'symbol' }}
          </span>
        </div>

        <!-- Add to cart / Out of stock -->
        <div *ngIf="product!.availableQuantity > 0; else out" class="buy">
          <label class="qty-label" for="qty">Qty</label>
          <select id="qty" [(ngModel)]="qty" class="select">
            <option *ngFor="let n of qtyOptions" [value]="n">{{ n }}</option>
          </select>

          <button (click)="addToCart()" class="btn btn-primary">
            Add to Cart
          </button>

          <div class="stock">
            In stock: <strong>{{ product!.availableQuantity }}</strong>
          </div>
        </div>

        <ng-template #out>
          <div class="out">Out of Stock</div>
        </ng-template>
      </div>
    </section>

    <!-- Reviews -->
    <section *ngIf="product" class="reviews">
      <h3 class="reviews-title">Reviews</h3>

      <div *ngIf="reviewsLoading" class="state small">
        <span class="dot"></span> Loading reviews...
      </div>

      <div *ngIf="!reviewsLoading && reviews.length === 0" class="state muted">
        No reviews yet. Be the first to review!
      </div>

      <ul *ngIf="!reviewsLoading && reviews.length > 0" class="review-list">
        <li *ngFor="let r of reviews" class="review-card">
          <div class="review-head">
            <strong class="review-user">{{ r.userName || 'User' }}</strong>
            <small class="review-date">{{ r.createdAt | date:'medium' }}</small>
          </div>

          <div class="stars" aria-label="Rating">
            <span *ngFor="let s of [1,2,3,4,5]">
              <span class="star" [class.on]="s <= r.rating">★</span>
            </span>
          </div>

          <div class="review-text">{{ r.comment }}</div>
        </li>
      </ul>

      <!-- Write a review -->
      <div *ngIf="(isLoggedIn$ | async)" class="write-card">
        <h4 class="write-title">Write a review</h4>

        <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
          <div class="write-grid">
            <div class="field small">
              <label class="label">Rating</label>
              <select [(ngModel)]="newReview.rating" name="rating" required class="select">
                <option [value]="5">5</option>
                <option [value]="4">4</option>
                <option [value]="3">3</option>
                <option [value]="2">2</option>
                <option [value]="1">1</option>
              </select>
            </div>

            <div class="field wide">
              <label class="label">Comment</label>
              <textarea
                [(ngModel)]="newReview.comment"
                name="comment"
                rows="3"
                maxlength="500"
                required
                class="textarea"
                placeholder="Share your experience…">
              </textarea>
            </div>
          </div>

          <div class="write-actions">
            <button type="submit" class="btn btn-primary" [disabled]="postingReview || !newReview.comment || !newReview.rating">
              Post Review
            </button>
            <span *ngIf="postingReview" class="posting">Posting...</span>
          </div>
        </form>
      </div>

      <div *ngIf="!(isLoggedIn$ | async)" class="login-hint">
        <em>Please login to write a review.</em>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      color: #111827;
    }

    .back-link {
      display: inline-flex;
      margin-bottom: 12px;
      color: #1faa59;
      font-weight: 900;
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }

    /* Layout */
    .layout {
      display: grid;
      gap: 16px;
      grid-template-columns: 1fr;
    }
    @media (min-width: 900px) {
      .layout { grid-template-columns: 1fr 1.5fr; }
    }

    /* Media */
    .media {
      border-radius: 18px;
      border: 1px solid #eef2f7;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .media-img {
      max-width: 100%;
      max-height: 320px;
      width: 100%;
      height: auto;
      object-fit: contain;
      padding: 12px;
      background: #fafafa;
    }

    .media-empty {
      color: #6b7280;
      font-weight: 700;
      padding: 12px;
    }

    /* Details */
    .details {
      border-radius: 18px;
      border: 1px solid #eef2f7;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
      padding: 16px;
    }

    .name {
      margin: 0 0 8px 0;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.2px;
    }

    .meta { margin-bottom: 10px; }

    .chip {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(31, 170, 89, 0.12);
      color: #117a3d;
      font-weight: 900;
      font-size: 12px;
    }

    .desc {
      margin: 0;
      color: #374151;
      line-height: 1.5;
      font-weight: 600;
    }

    .spec {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .section-title {
      margin: 0 0 8px 0;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.1px;
    }

    .spec-list {
      margin: 0;
      padding-left: 18px;
      color: #374151;
      font-weight: 600;
    }

    /* Price */
    .price-row {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }

    .price {
      font-size: 22px;
      font-weight: 950;
      letter-spacing: 0.2px;
      font-variant-numeric: tabular-nums;
    }

    .mrp {
      font-size: 13px;
      color: #6b7280;
      text-decoration: line-through;
      font-weight: 800;
    }

    .badge {
      font-size: 12px;
      font-weight: 900;
      color: #0f5132;
      background: rgba(34, 197, 94, 0.14);
      border: 1px solid rgba(34, 197, 94, 0.18);
      border-radius: 999px;
      padding: 5px 10px;
    }

    /* Buy row */
    .buy {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }

    .qty-label {
      font-weight: 900;
      color: #374151;
    }

    .stock {
      color: #6b7280;
      font-weight: 700;
      margin-left: auto;
    }

    .out {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(180, 35, 24, 0.25);
      background: rgba(180, 35, 24, 0.06);
      color: #b42318;
      font-weight: 950;
      display: inline-block;
    }

    /* Controls */
    .select, .textarea {
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: #fbfdff;
      color: #111827;
      outline: none;
      transition: box-shadow 160ms ease, border-color 160ms ease, background 160ms ease;
    }

    .select {
      height: 40px;
      padding: 0 12px;
      min-width: 86px;
    }

    .textarea {
      width: 100%;
      padding: 10px 12px;
      resize: vertical;
      min-height: 92px;
    }

    .select:focus, .textarea:focus {
      border-color: #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
      background: #ffffff;
    }

    /* Buttons */
    .btn {
      height: 40px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid transparent;
      font-weight: 950;
      cursor: pointer;
      user-select: none;
      transition: transform 120ms ease, box-shadow 160ms ease, opacity 160ms ease;
    }
    .btn:active { transform: translateY(1px); }

    .btn-primary {
      background: #1faa59;
      color: #ffffff;
      box-shadow: 0 12px 22px rgba(31, 170, 89, 0.18);
    }
    .btn-primary:hover {
      box-shadow: 0 16px 28px rgba(31, 170, 89, 0.24);
    }
    .btn[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Reviews */
    .reviews {
      margin-top: 22px;
    }

    .reviews-title {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 950;
    }

    .review-list {
      list-style: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 0;
    }

    .review-card {
      border: 1px solid #eef2f7;
      border-radius: 16px;
      padding: 12px;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
    }

    .review-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .review-user {
      font-weight: 950;
      color: #111827;
    }

    .review-date {
      color: #6b7280;
      font-weight: 700;
    }

    .stars { margin: 6px 0 8px 0; }

    .star {
      color: #d1d5db;
      font-size: 16px;
      line-height: 1;
    }
    .star.on { color: #f59e0b; }

    .review-text {
      color: #374151;
      font-weight: 600;
      line-height: 1.45;
    }

    /* Write review card */
    .write-card {
      margin-top: 14px;
      border: 1px solid #eef2f7;
      border-radius: 18px;
      padding: 14px;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);
    }

    .write-title {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 950;
    }

    .write-grid {
      display: grid;
      gap: 12px;
      grid-template-columns: 1fr;
    }

    @media (min-width: 820px) {
      .write-grid {
        grid-template-columns: 180px 1fr;
      }
      .field.small { max-width: 200px; }
    }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 900;
      letter-spacing: 0.02em;
    }

    .write-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }

    .posting {
      color: #6b7280;
      font-weight: 800;
    }

    .login-hint {
      margin-top: 12px;
      color: #6b7280;
      font-weight: 650;
    }

    /* States */
    .state {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      border-radius: 12px;
      border: 1px dashed #e5e7eb;
      background: #fafafa;
      color: #374151;
      font-weight: 800;
    }
    .state.small { padding: 10px 12px; font-weight: 750; }
    .state.muted { color: #6b7280; font-weight: 700; }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #1faa59;
      box-shadow: 0 0 0 3px rgba(31, 170, 89, 0.18);
      animation: pulse 1.2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.35); opacity: 0.55; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;

  qty = 1;
  qtyOptions: number[] = [];

  //  spec lines to render as bullets
  specLines: string[] = [];

  reviews: Review[] = [];
  reviewsLoading = false;

  newReview: CreateReviewRequest = { rating: 5, comment: '' };
  postingReview = false;

  isLoggedIn$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private productsSvc: ProductsService,
    private cartSvc: CartService,
    private userStore: UserStore
  ) {
    this.isLoggedIn$ = this.userStore.isLoggedIn$;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loadProduct(id);
    this.loadReviews(id);
  }

  private loadProduct(id: number) {
    this.loading = true;
    this.productsSvc.getProduct(id).subscribe({
      next: p => {
        this.product = p;
        this.loading = false;

        // build qty options
        const max = Math.min(10, Math.max(0, p.availableQuantity));
        this.qtyOptions = Array.from({ length: max }, (_, i) => i + 1);
        this.qty = this.qtyOptions.length > 0 ? 1 : 0;

        //  split specification into bullet points
        const raw = (p.specification ?? '').trim();
        this.specLines = raw
          ? raw.split(/[\r\n]+|;|,|•/).map(s => s.trim()).filter(Boolean)
          : [];
      },
      error: _ => { this.product = null; this.loading = false; }
    });
  }

  private loadReviews(id: number) {
    this.reviewsLoading = true;
    this.productsSvc.getReviews(id).subscribe({
      next: list => { this.reviews = list; this.reviewsLoading = false; },
      error: _ => { this.reviews = []; this.reviewsLoading = false; }
    });
  }

  addToCart(): void {
    if (!this.product) return;
    if (this.product.availableQuantity <= 0) return;
    if (this.qty <= 0) return;

    this.cartSvc.addItem(this.product.id, this.qty).subscribe({
      next: () => alert('Added to cart'),
      error: err => { console.error(err); alert('Could not add to cart. Please login or try again.'); }
    });
  }

  submitReview(): void {
    if (!this.product) return;
    if (!this.newReview.comment || !this.newReview.rating) return;

    this.postingReview = true;
    this.productsSvc.addReview(this.product.id, this.newReview).subscribe({
      next: _ => {
        this.postingReview = false;
        this.newReview = { rating: 5, comment: '' };
        this.loadReviews(this.product!.id); // refresh list
      },
      error: _ => { this.postingReview = false; alert('Failed to post review.'); }
    });
  }
}
