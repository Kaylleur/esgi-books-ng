import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  if (authService.accessToken) {
    return next(
      req.clone({
        headers: req.headers.set(
          'Authorization',
          'Bearer ' + authService.accessToken,
        ),
      }),
    );
  }

  return next(req);
};
