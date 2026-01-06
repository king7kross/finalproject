// src/app/shared/components/product-card/product-card.component.ts
import { Component, Input } from '@angular/core';
import { Product } from '../../../shared/models/product.models';
import { CurrencyPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'gs-product-card',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, NgIf],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;
}
