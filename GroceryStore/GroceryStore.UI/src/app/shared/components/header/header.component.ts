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
  templateUrl: './header.component.html'
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
