// src/app/shared/components/toast/toast.component.ts
import { Component } from '@angular/core';
import { NgFor, AsyncPipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'gs-toast',
  standalone: true,
  imports: [NgFor, AsyncPipe], // ✅ added AsyncPipe here
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  constructor(public toast: ToastService) { }
}
