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
import { NgForOf } from '@angular/common';
import { CategoryService, Category } from '../../../shared/services/category.service'; // <-- import du service

@Component({
  selector: 'app-book-detail',
  imports: [ReactiveFormsModule, NgForOf],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css',
  standalone: true
})
export class BookDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #bookService = inject(BookService);
  readonly #fb = inject(FormBuilder);
  // Nouvel inject pour récupérer les catégories
  readonly #categoryService = inject(CategoryService);

  readonly bookId = input(undefined);

  reviews: any[] = [];
  isLoading = signal(false);

  // Liste qu'on va remplir au ngOnInit
  categories: Category[] = [];

  // On ajoute un champ category
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
    category: [''],
  });

  // Form pour les reviews (inchangé)
  readonly reviewForm = this.#fb.group({
    message: ['', [Validators.required]],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  ngOnInit() {
    // Charger la liste des catégories disponibles
    this.#categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => console.error('Erreur lors du fetch categories', err),
    });

    // Si on édite un livre existant
    if (this.bookId()) {
      this.#bookService.getBook(this.bookId()!).subscribe((book) => {
        // On patch le formulaire
        this.form.patchValue({
          ...book,
          publishDate: new Date(book.publishDate).toISOString().split('T')[0],
          // Si book.category est un objet, vous voudrez mettre book.category.id
          // Si c'est directement l'ID, on met book.category
        });
        this.reviews = book.reviews || [];
      });
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

    if (!this.bookId()) {
      // Création
      this.#bookService
        .createBook(this.form.value as Book)
        .subscribe((book) => {
          this.#router.navigate(['..', book.id], { relativeTo: this.#route });
          this.isLoading.set(false);
        });
    } else {
      // Mise à jour
      this.#bookService
        .updateBook(this.bookId()!, this.form.value as Book)
        .subscribe(() => {
          this.isLoading.set(false);
        });
    }
  }

  addReview() {
    if (!this.reviewForm.valid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { message, rating } = this.reviewForm.value;

    this.#bookService
      .addReviews({
        bookId: this.bookId()!,
        user: 'Anonymous',
        message: message!,
        rating: rating!,
      })
      .subscribe(() => {
        this.isLoading.set(false);
        this.reviewForm.reset();
      });
  }
}

function isPast(ctrl: AbstractControl): ValidationErrors | null {
  if (!ctrl.value) {
    return null;
  }
  const date = new Date(ctrl.value);

  return Date.now() < date.getTime() ? { isPastInvalid: true } : null;
}
