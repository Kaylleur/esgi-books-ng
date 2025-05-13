import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {first, firstValueFrom} from 'rxjs';
import {LoginResponse} from './auth.interface';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.accessToken) {
   await firstValueFrom<LoginResponse>(auth.refresh$())
  }
    return auth.accessToken ? true : router.navigate(['/login']);
};
