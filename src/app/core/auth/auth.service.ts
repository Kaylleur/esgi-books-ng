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
      .post<LoginResponse>('/api/auth/login', {
        email,
        password,
      })
      .pipe(tap((response) => (this.accessToken = response.accessToken)));
  }

  signUp(email: string, password: string){
    return this.#http.post('/api/users', {
      email,
      password
    });
  }

  refresh$() {
    return this.#http.get<LoginResponse>('api/auth/refresh')
      .pipe(tap((response) => (this.accessToken = response.accessToken)));
  }

  clearToken() {
    this.accessToken = undefined;
  }
}
