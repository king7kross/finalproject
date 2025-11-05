// src/app/core/interceptors/auth-cookie.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authCookieInterceptor: HttpInterceptorFn = (req, next) => {
  const withCreds = req.clone({ withCredentials: true }); // vital for cookie auth
  return next(withCreds);
};
