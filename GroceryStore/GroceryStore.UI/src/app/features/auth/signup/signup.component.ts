import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { confirmMatch, nameValidator, emailValidator, phoneValidator } from '../../../core/utils/validators';
import { SignupRequest } from '../../../shared/models/auth.models';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100), nameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      phoneNumber: ['', [Validators.required, phoneValidator()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      // ✅ Apply confirmMatch to *this control*, referencing the "password" control
      confirmPassword: ['', [Validators.required, confirmMatch('password')]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const v = this.form.value as any;
    const request: SignupRequest = {
      fullName: v.fullName,
      email: v.email,
      phoneNumber: v.phoneNumber,
      password: v.password,
      confirmPassword: v.confirmPassword
    };

    this.auth.signup(request).subscribe({
      next: res => {
        this.loading = false;
        // ❌ No setUser here; user is NOT logged in after signup
        this.toast.success(res?.message || 'Account created. Please login.');
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.loading = false;
        // error interceptor will show a message if configured
      }
    });
  }
}
