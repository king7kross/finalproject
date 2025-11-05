// src/app/features/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserStore } from '../../../core/state/user.store';
import { ToastService } from '../../../core/services/toast.service';
import { NgIf } from '@angular/common';
import { confirmMatch, passwordRule, phoneOptional } from '../../../core/utils/validators';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  // ...
  template: `
  <h2>Signup</h2>
  <form [formGroup]="form" (ngSubmit)="onSubmit()" style="display:grid; gap:12px; max-width:420px;">
    <div>
      <label>Full Name</label><br />
      <input formControlName="fullName" />
      <div *ngIf="f['fullName'].touched && f['fullName'].invalid" style="color:#c00; font-size:12px;">
        <div *ngIf="f['fullName'].errors?.['required']">Full Name is required.</div>
        <div *ngIf="f['fullName'].errors?.['maxlength']">Max 100 characters.</div>
      </div>
    </div>

    <div>
      <label>Email</label><br />
      <input formControlName="email" />
      <div *ngIf="f['email'].touched && f['email'].invalid" style="color:#c00; font-size:12px;">
        <div *ngIf="f['email'].errors?.['required']">Email is required.</div>
        <div *ngIf="f['email'].errors?.['email']">Invalid email.</div>
      </div>
    </div>

    <div>
      <label>Phone (optional)</label><br />
      <input formControlName="phone" />
      <div *ngIf="f['phone'].touched && f['phone'].invalid" style="color:#c00; font-size:12px;">
        <div *ngIf="f['phone'].errors?.['phone']">Use digits (optional +), 7–15 chars.</div>
      </div>
    </div>

    <div>
      <label>Password</label><br />
      <input type="password" formControlName="password" />
      <div *ngIf="f['password'].touched && f['password'].invalid" style="color:#c00; font-size:12px;">
        <div *ngIf="f['password'].errors?.['required']">Password is required.</div>
        <div *ngIf="f['password'].errors?.['password']">
          Min 8 chars, include upper, lower, digit, special.
        </div>
      </div>
    </div>

    <div>
      <label>Confirm Password</label><br />
      <input type="password" formControlName="confirmPassword" />
      <div *ngIf="f['confirmPassword'].touched && f['confirmPassword'].invalid" style="color:#c00; font-size:12px;">
        <div *ngIf="f['confirmPassword'].errors?.['required']">Confirm is required.</div>
        <div *ngIf="f['confirmPassword'].errors?.['mismatch']">Passwords must match.</div>
      </div>
    </div>

    <button [disabled]="form.invalid || loading">{{ loading ? 'Creating...' : 'Signup' }}</button>
    <div style="font-size:12px;">Have an account? <a routerLink="/login">Login</a></div>
  </form>
`

})
export class SignupComponent {
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private store: UserStore,
    private router: Router,
    private toast: ToastService
  ) {
    // ✅ Initialize form inside constructor
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [phoneOptional()]],
      password: ['', [passwordRule()]],
      confirmPassword: ['', [Validators.required, confirmMatch('password')]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    const v = this.form.value as any;

    this.auth.signup({
      fullName: v.fullName,
      email: v.email,
      phone: v.phone || undefined,
      password: v.password,
      confirmPassword: v.confirmPassword
    }).subscribe({
      next: me => {
        this.loading = false;
        this.store.setUser(me);          // server logs in on success
        this.toast.success('Account created.');
        this.router.navigateByUrl('/');
      },
      error: () => { this.loading = false; /* error interceptor shows toast */ }
    });
  }
}
