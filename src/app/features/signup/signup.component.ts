
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  standalone: true,
  styleUrl: './signup.component.css',
})
export default class SignupComponent {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  readonly isLoading = signal(false);
  readonly isInvalid = signal(false);

  readonly form = this.#fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  signUp() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { password, email } = this.form.getRawValue();
    this.#authService.signUp(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.#router.navigate(['/login']);
      },
      error: () => {
        this.isInvalid.set(true);
      },
    });
  }
}
