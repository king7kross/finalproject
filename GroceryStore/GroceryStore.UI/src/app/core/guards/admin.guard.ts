// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../state/user.store';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const store = inject(UserStore);
  const router = inject(Router);

  return store.user$.pipe(
    take(1),
    map(user => {
      if (user && user.isAdmin) return true;
      router.navigateByUrl('/');
      return false;
    })
  );
};
