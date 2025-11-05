// src/app/features/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserStore } from '../../../core/state/user.store';
import { ToastService } from '../../../core/services/toast.service';
import { CommonModule } from '@angular/common';
import { confirmMatch, passwordRule, nameValidator, emailValidator, phoneValidator } from '../../../core/utils/validators';
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
    private store: UserStore,
    private router: Router,
    private toast: ToastService
  ) {
    // ✅ Initialize form inside constructor
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100), nameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      phoneNumber: ['', [Validators.required, phoneValidator()]], // now required
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
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
      phoneNumber: v.phoneNumber, // matches backend field name
      password: v.password,
      confirmPassword: v.confirmPassword
    };

    this.auth.signup(request).subscribe({
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
