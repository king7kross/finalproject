// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserStore } from '../../../core/state/user.store';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <h2 class="login">Login</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label>Email</label>
        <input formControlName="email" />
        <div *ngIf="form.controls['email'].touched && form.controls['email'].invalid">
          <div *ngIf="form.controls['email'].errors?.['required']">Email is required.</div>
          <div *ngIf="form.controls['email'].errors?.['email']">Invalid email.</div>
        </div>
      </div>

      <div>
        <label>Password</label>
        <input type="password" formControlName="password" />
        <div *ngIf="form.controls['password'].touched && form.controls['password'].invalid">
          <div *ngIf="form.controls['password'].errors?.['required']">Password is required.</div>
        </div>
      </div>

      <button [disabled]="form.invalid || loading">{{ loading ? 'Signing in...' : 'Login' }}</button>
      <div>No account? <a routerLink="/signup">Signup</a></div>
    </form>
  `,
  styles: [`
    .login {
      text-align:center;
    }`
  ]

})
export class LoginComponent {
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private store: UserStore,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value as any;

    this.auth.login({ email: v.email, password: v.password }).subscribe({
      next: me => {
        this.loading = false;
        this.store.setUser(me);
        this.toast.success('Logged in.');
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Login failed.');
      }
    });
  }
}
