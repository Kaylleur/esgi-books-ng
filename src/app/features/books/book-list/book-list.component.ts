import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe, NgIf, NgForOf } from '@angular/common';
import { RowComponent } from './row/row.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../../shared/services/book.service';
import { debounceTime, switchMap } from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RowComponent,
    RouterLink,
    AsyncPipe,
    NgIf,
    NgForOf,
    FormsModule,
    FormsModule,
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent implements OnInit {
  readonly #bookService = inject(BookService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  // Champs pour le filtre et le tri
  searchTitle = '';
  sortField = '';

  // On récupère les queryParams et on appelle le service
  // On prend en compte `title` et `sort` en plus de `limit` et `skip`
  readonly books$ = this.#route.queryParams.pipe(
    // debounceTime(300) si on veut limiter la fréquence d'appels
    debounceTime(300),
    switchMap(({ limit, skip, title, sort }) => {
      // Valeurs par défaut
      const l = parseInt(limit ?? '10', 10);
      const s = parseInt(skip ?? '0', 10);
      return this.#bookService.getBooks(l, s, title, sort);
    })
  );

  // Convertit le flux en signal
  books = toSignal(this.books$);

  // Calcul de stats sur la liste de livres
  readonly stats = computed(() => {
    const books = this.books();
    if (!books) {
      return null;
    }

    const totalQuantity = books.reduce((acc, book) => acc + book.quantity, 0);
    const totalPrice = books.reduce((acc, book) => acc + book.price, 0);
    const avgPrice = totalPrice / (books.length || 1);

    return { totalQuantity, totalPrice, avgPrice };
  });

  ngOnInit(): void {
    // Initialiser nos champs locaux à partir des queryParams actuels
    const { title, sort } = this.#route.snapshot.queryParams;
    this.searchTitle = title ?? '';
    this.sortField = sort ?? '';
  }

  // Mise à jour de l’URL lorsque l’utilisateur change le filtre ou le tri
  updateFilterParams() {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParamsHandling: 'merge',
      // On remet skip à 0 quand on change le filtre ou le tri (souvent logique en UX)
      queryParams: {
        title: this.searchTitle || null, // si champ vide, on retire le param
        sort: this.sortField || null,
        skip: 0
      }
    });
  }

  nextPage() {
    const limit = parseInt(this.#route.snapshot.queryParams['limit'] ?? '10', 10);
    const skip = parseInt(this.#route.snapshot.queryParams['skip'] ?? '0', 10) + limit;

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParamsHandling: 'merge',
      queryParams: { skip, limit },
    });
  }

  previousPage() {
    const limit = parseInt(this.#route.snapshot.queryParams['limit'] ?? '10', 10);
    let skip = parseInt(this.#route.snapshot.queryParams['skip'] ?? '0', 10) - limit;
    skip = skip < 0 ? 0 : skip;

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParamsHandling: 'merge',
      queryParams: { skip, limit },
    });
  }
}
