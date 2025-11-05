// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../state/user.store';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const store = inject(UserStore);
  const router = inject(Router);

  return store.user$.pipe(
    take(1),
    map(user => {
      if (user) return true;
      router.navigateByUrl('/login');
      return false;
    })
  );
};
