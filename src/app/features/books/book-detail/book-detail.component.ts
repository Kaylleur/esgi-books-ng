import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BookService } from '../../../shared/services/book.service';
import { Book } from '../../../shared/interfaces/book.interface';

@Component({
  selector: 'app-book-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css',
  standalone: true
})
export class BookDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #bookService = inject(BookService);
  readonly #fb = inject(FormBuilder);

  readonly bookId = input(undefined);

  readonly isLoading = signal(false);

  readonly form = this.#fb.group({
    title: ['', [Validators.required]],
    author: ['', [Validators.required]],
    publishDate: ['', [Validators.required, isPast]],
    isbn: [
      '',
      [
        Validators.required,
        Validators.pattern(/[0-9]-[0-9]{4}-[0-9]{4}-[0-9]/),
      ],
    ],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    quantity: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    if (this.bookId()) {
      this.#bookService.getBook(this.bookId()!).subscribe((book) =>
        this.form.patchValue({
          ...book,
          publishDate: new Date(book.publishDate).toISOString().split('T')[0],
        }),
      );
    }
  }

  submitForm() {
    console.log(this.form.value);
    console.table(
      Object.entries(this.form.controls).map(([key, ctrl]) => ({
        key,
        value: ctrl.value,
        valid: ctrl.valid,
        errors: ctrl.errors,
      })),
    );

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    console.log('this.bookId()');
    console.log(this.bookId());

    if (      this.bookId()) {
      this.#bookService
        .createBook(this.form.value as Book)
        .subscribe((book) => {
          this.#router.navigate(['..', book._id], { relativeTo: this.#route });
          this.isLoading.set(false);
        });
    } else {
      this.#bookService
        .updateBook(this.bookId()!, this.form.value as Book)
        .subscribe(() => {
          this.isLoading.set(false);
        });
    }
  }
}

function isPast(ctrl: AbstractControl): ValidationErrors | null {
  if (!ctrl.value) {
    return null;
  }
  const date = new Date(ctrl.value);

  return Date.now() < date.getTime() ? { isPastInvalid: true } : null;
}
