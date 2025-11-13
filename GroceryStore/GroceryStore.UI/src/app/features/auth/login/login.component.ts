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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // Button loading state
  loading = false;

  // Reactive form
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private store: UserStore,
    private router: Router,
    private toast: ToastService
  ) {
    // Create login form
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const v = this.form.value as any;

    // Call login API
    this.auth.login({ email: v.email, password: v.password }).subscribe({
      next: me => {
        this.loading = false;
        // Save logged-in user globally
        this.store.setUser(me);
        this.toast.success('Logged in.');
        // Redirect to home
        this.router.navigateByUrl('/');
      },
      error: err => {
        this.loading = false;
        // Show API error message if available
        this.toast.error(err.error?.message || 'Login failed.');
      }
    });
  }
}
