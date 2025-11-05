// src/app/shared/components/pagination/pagination.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'gs-pagination',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="totalCount > pageSize" style="display:flex; gap:8px; align-items:center; justify-content:center; margin-top:12px;">
      <button (click)="prev()" [disabled]="page <= 1">Prev</button>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <button (click)="next()" [disabled]="page >= totalPages">Next</button>
    </div>
  `
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() pageSize = 12;
  @Input() totalCount = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    if (this.pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  prev() {
    if (this.page > 1) this.pageChange.emit(this.page - 1);
  }

  next() {
    if (this.page < this.totalPages) this.pageChange.emit(this.page + 1);
  }
}
