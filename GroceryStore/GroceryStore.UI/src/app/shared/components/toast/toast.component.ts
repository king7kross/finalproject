// src/app/shared/components/toast/toast.component.ts
import { Component } from '@angular/core';
import { NgFor, AsyncPipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'gs-toast',
  standalone: true,
  imports: [NgFor, AsyncPipe], // ✅ added AsyncPipe here
  template: `
    <div style="position:fixed; right:16px; bottom:16px; display:flex; flex-direction:column; gap:8px; z-index:9999;">
      <div *ngFor="let t of toast.list$ | async"
           [style.background]="t.type === 'success' ? '#e6f4ea' : t.type === 'error' ? '#fdecea' : '#e8f0fe'"
           [style.color]="t.type === 'success' ? '#137333' : t.type === 'error' ? '#a50e0e' : '#174ea6'"
           style="border-radius:8px; padding:10px 12px; border:1px solid #ddd; min-width:220px; box-shadow:0 2px 8px rgba(0,0,0,.07);">
        {{ t.text }}
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toast: ToastService) { }
}
