// src/app/shared/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserStore } from '../../../core/state/user.store';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'gs-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf],
  template: `
    <header style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid #eee;">
      <a routerLink="/" style="text-decoration:none; font-weight:600;">Grocery Store</a>

      <nav *ngIf="(userStore.isLoggedIn$ | async) === true; else anon" style="display:flex; gap:12px; align-items:center;">
        <span>Hi, {{ userStore.snapshot?.fullName }}</span>
        <a routerLink="/cart">View Cart</a>
        <a routerLink="/orders">My Orders</a>
        <!-- changed: show admin link if observable isAdmin$ OR snapshot flags indicate admin role -->
        <a *ngIf="(userStore.isAdmin$ | async) 
                   || userStore.snapshot?.isAdmin"
           routerLink="/admin">
          Manage Products
        </a>
        <button (click)="onLogout()" style="border:1px solid #ddd; padding:4px 8px; background:#fff; cursor:pointer;">Sign-out</button>
      </nav>

      <ng-template #anon>
        <nav style="display:flex; gap:12px;">
          <a routerLink="/login">Login</a>
          <a routerLink="/signup">Signup</a>
        </nav>
      </ng-template>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  constructor(
    private auth: AuthService,
    public userStore: UserStore,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Try to load current user (if cookie present)
    this.auth.me().subscribe({
      next: me => {
        console.log('User loaded:', me);
        this.userStore.setUser(me);
      },
      error: err => {
        console.log('Failed to load user:', err);
        this.userStore.clear();
      }
    });
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.userStore.clear();
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.userStore.clear();
        this.router.navigateByUrl('/');
      }
    });
  }
}
