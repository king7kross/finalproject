// src/app/shared/models/auth.models.ts
export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface MeResponse {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
}
