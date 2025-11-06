import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../shared/models/product.models';
import { CommonModule, NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { Review, CreateReviewRequest } from '../../../shared/models/review.models';
import { UserStore } from '../../../core/state/user.store';
import { Observable, map } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf, NgFor, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <a routerLink="/" style="display:inline-block; margin-bottom:12px;">← Back</a>

    <section *ngIf="loading">Loading...</section>
    <section *ngIf="!loading && !product">Product not found.</section>

    <section *ngIf="product" style="display:grid; gap:16px; grid-template-columns: 1fr 1.5fr;">
      <div style="background:#fafafa; border:1px solid #eee; border-radius:8px; min-height:260px; display:flex; align-items:center; justify-content:center;">
        <img *ngIf="product!.imageUrl" [src]="product!.imageUrl!" alt="{{product!.name}}" style="max-width:100%; max-height:240px;">
        <span *ngIf="!product!.imageUrl" style="color:#888;">No Image</span>
      </div>

      <div>
        <h2 style="margin:0 0 8px 0;">{{ product!.name }}</h2>
        <div style="color:#666; margin-bottom:8px;">Category: {{ product!.category }}</div>
        <p style="margin-top:0;">{{ product!.description }}</p>

        <div style="display:flex; align-items:baseline; gap:8px; margin:12px 0;">
          <span style="font-size:18px;">{{ (product!.price - (product!.discount || 0)) | currency:'INR':'symbol' }}</span>
          <span *ngIf="product!.discount && product!.discount! > 0" style="font-size:13px; color:#0a7; text-decoration:line-through;">
            {{ product!.price | currency:'INR':'symbol' }}
          </span>
        </div>

        <div *ngIf="product!.availableQuantity > 0; else out" style="display:flex; gap:8px; align-items:center; margin-top:8px;">
          <label for="qty">Qty:</label>
          <select id="qty" [(ngModel)]="qty" style="padding:6px;">
            <option *ngFor="let n of qtyOptions" [value]="n">{{ n }}</option>
          </select>
          <button (click)="addToCart()" style="padding:6px 10px;">Add to Cart</button>
        </div>

        <ng-template #out>
          <div style="margin-top:8px; color:#c00; font-weight:600;">Out of Stock</div>
        </ng-template>
      </div>
    </section>

    <!-- Reviews -->
    <section *ngIf="product" style="margin-top:24px;">
      <h3 style="margin:0 0 8px 0;">Reviews</h3>

      <div *ngIf="reviewsLoading">Loading reviews...</div>
      <div *ngIf="!reviewsLoading && reviews.length === 0" style="color:#666;">No reviews yet. Be the first to review!</div>

      <ul *ngIf="!reviewsLoading && reviews.length > 0" style="list-style:none; padding-left:0; display:flex; flex-direction:column; gap:8px;">
        <li *ngFor="let r of reviews" style="border:1px solid #eee; border-radius:8px; padding:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>{{ r.userName || 'User' }}</strong>
            <small style="color:#666;">{{ r.createdAt | date:'medium' }}</small>
          </div>
          <div style="margin:4px 0;">
            <span *ngFor="let s of [1,2,3,4,5]">
              <span [style.color]="s <= r.rating ? '#fa0' : '#ccc'">★</span>
            </span>
          </div>
          <div>{{ r.comment }}</div>
        </li>
      </ul>

      <!-- Write a review (only when logged in) -->
      <div *ngIf="(isLoggedIn$ | async)" style="margin-top:16px; border:1px solid #eee; border-radius:8px; padding:12px;">
        <h4 style="margin:0 0 8px 0;">Write a review</h4>
        <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
          <label>Rating:</label>
          <select [(ngModel)]="newReview.rating" name="rating" required>
            <option [value]="5">5</option>
            <option [value]="4">4</option>
            <option [value]="3">3</option>
            <option [value]="2">2</option>
            <option [value]="1">1</option>
          </select>
          <br />
          <label>Comment:</label>
          <textarea [(ngModel)]="newReview.comment" name="comment" rows="3" maxlength="500" required style="width:100%;"></textarea>
          <div style="margin-top:8px;">
            <button type="submit" [disabled]="postingReview || !newReview.comment || !newReview.rating">Post Review</button>
            <span *ngIf="postingReview" style="margin-left:8px;">Posting...</span>
          </div>
        </form>
      </div>

      <div *ngIf="!(isLoggedIn$ | async)" style="margin-top:12px; color:#666;">
        <em>Please login to write a review.</em>
      </div>
    </section>
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;

  qty = 1;
  qtyOptions: number[] = [];

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
        const max = Math.min(10, Math.max(0, p.availableQuantity));
        this.qtyOptions = Array.from({ length: max }, (_, i) => i + 1);
        this.qty = this.qtyOptions.length > 0 ? 1 : 0;
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
