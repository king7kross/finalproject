import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, SignupRequest, MeResponse } from '../../shared/models/auth.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl + '/api/auth';

  constructor(private http: HttpClient) { }

  // ✅ Signup no longer returns a logged-in user; just a message
  signup(payload: SignupRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/signup`, payload);
  }

  login(payload: LoginRequest): Observable<MeResponse> {
    return this.http.post<MeResponse>(`${this.base}/login`, payload);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {});
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.base}/me`);
  }
}
