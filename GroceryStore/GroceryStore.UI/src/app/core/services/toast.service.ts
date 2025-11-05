// src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMsg { id: number; text: string; type: ToastType; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _list$ = new BehaviorSubject<ToastMsg[]>([]);
  list$ = this._list$.asObservable();
  private seq = 1;

  private push(text: string, type: ToastType, ms = 3000) {
    const id = this.seq++;
    const item: ToastMsg = { id, text, type };
    this._list$.next([...this._list$.value, item]);
    setTimeout(() => this.remove(id), ms);
  }

  success(t: string, ms = 3000) { this.push(t, 'success', ms); }
  error(t: string, ms = 4000) { this.push(t, 'error', ms); }
  info(t: string, ms = 3000) { this.push(t, 'info', ms); }

  remove(id: number) {
    this._list$.next(this._list$.value.filter(x => x.id !== id));
  }
}
