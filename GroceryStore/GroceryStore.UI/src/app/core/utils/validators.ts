// src/app/core/utils/validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Min 8, at least one uppercase, one lowercase, one digit, one special
export const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function passwordRule(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString();
    if (!v) return { required: true };
    return passwordPattern.test(v) ? null : { password: true };
  };
}

export function confirmMatch(matchTo: string): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const parent = c.parent as any;
    if (!parent) return null;
    const a = (c.value ?? '').toString();
    const b = (parent.controls?.[matchTo]?.value ?? '').toString();
    return a === b ? null : { mismatch: true };
  };
}



export function nameValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return { required: true };
    // Only alphabets and spaces
    return /^[a-zA-Z\s]+$/.test(v) ? null : { invalidName: true };
  };
}

export function emailValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return { required: true };
    // Basic email format: something@something.com
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : { invalidEmail: true };
  };
}

export function phoneValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = (c.value ?? '').toString().trim();
    if (!v) return { required: true };
    // Max 10 digits
    return /^[0-9]{10}$/.test(v) ? null : { invalidPhone: true };
  };
}
