import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest,} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth.service';
import {catchError, first, of, switchMap, throwError} from 'rxjs';
import {Router} from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  function refreshAndRetry$(request: HttpRequest<unknown>, next: HttpHandlerFn) {
    return authService.refresh$().pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          console.error(err.message);
        }
        authService.clearToken();
        return router.navigate(['/login']);
      }),
      first(),
      switchMap(() => next(addBearer(request))),
    );
  }

  function addBearer(req: HttpRequest<unknown>): HttpRequest<unknown> {
    const token = authService.accessToken;
    const headers = req.headers.append('Authorization', `Bearer ${token}`);
    return token ? req.clone({headers}) : req;
  }

  return next(addBearer(req)) //
    .pipe(catchError(err => {
      if (err.status === 401) {
        return refreshAndRetry$(req, next);
      } else {
        return throwError(() => err);
      }
    }));
};

