import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, SignupRequest, MeResponse } from '../../shared/models/auth.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Base URL for authentication endpoints
  private base = environment.apiBaseUrl + '/api/auth';

  constructor(private http: HttpClient) { }

  // Register a new user
  signup(payload: SignupRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/signup`, payload);
  }

  // Log in an existing user
  login(payload: LoginRequest): Observable<MeResponse> {
    return this.http.post<MeResponse>(`${this.base}/login`, payload);
  }

  // Log out the current user
  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {});
  }

  // Get current authenticated user info
  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.base}/me`);
  }
}
