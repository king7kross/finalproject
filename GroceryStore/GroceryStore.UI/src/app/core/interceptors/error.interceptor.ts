// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Keep it simple now; we’ll add toasts later.
      console.error('HTTP error:', err.status, err.error);
      let message = 'Something went wrong. Please try again.';
      if (err.status === 0) message = 'Cannot reach server.';
      if (err.status === 401) message = 'Please login to continue.';
      if (err.status === 403) message = 'You are not allowed to perform this action.';
      return throwError(() => new Error(message));
    })
  );
};
