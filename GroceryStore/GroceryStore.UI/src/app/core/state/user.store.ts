// src/app/core/state/user.store.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { MeResponse } from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private _user$ = new BehaviorSubject<MeResponse | null>(null);
  user$ = this._user$.asObservable();

  setUser(u: MeResponse | null) {
    this._user$.next(u);
  }

  get snapshot(): MeResponse | null {
    return this._user$.value;
  }

  isLoggedIn$ = this.user$.pipe(map(u => !!u));
  isAdmin$ = this.user$.pipe(map(u => !!u && u.isAdmin === true));

  clear() {
    this._user$.next(null);
  }
}
