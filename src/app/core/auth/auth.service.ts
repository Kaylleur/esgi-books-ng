import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from './auth.interface';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #http = inject(HttpClient);

  accessToken?: string;

  login(email: string, password: string) {
    return this.#http
      .post<LoginResponse>('http://localhost:3000/api/auth/login', {
        email,
        password,
      })
      .pipe(tap((response) => (this.accessToken = response.accessToken)));
  }
}
