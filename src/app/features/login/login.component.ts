import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export default class LoginComponent {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  readonly isLoading = signal(false);
  readonly isInvalid = signal(false);

  readonly form = this.#fb.nonNullable.group({
    email: ['admin@localhost', Validators.required],
    password: ['admin', Validators.required],
  });

  submitLogin() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { password, email } = this.form.getRawValue();
    this.#authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.#router.navigate(['/']);
      },
      error: () => {
        this.isInvalid.set(true);
      },
    });
  }
}
