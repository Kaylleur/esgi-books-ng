import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import {AsyncPipe, CurrencyPipe, DecimalPipe} from '@angular/common';
import { RowComponent } from './row/row.component';
import { toSignal } from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { BookService } from '../../../shared/services/book.service';
import {debounceTime, switchMap} from 'rxjs';

@Component({
  selector: 'app-book-list',
  imports: [CurrencyPipe, DecimalPipe, RowComponent, RouterLink, AsyncPipe],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BookListComponent {
  readonly #bookService = inject(BookService);
  readonly #route = inject(ActivatedRoute)
  readonly #router = inject(Router)
  readonly books$ = this.#route.queryParams.pipe(
    debounceTime(300),
    switchMap(({ limit, skip }) => this.#bookService.getBooks(limit || 10, skip ||0))
  )

  books = toSignal(this.books$);

  readonly stats = computed(() => {
    const books = this.books();
    if (!books) {
      return null;
    }

    const totalQuantity = books.reduce((acc, book) => acc + book.quantity, 0);
    const totalPrice = books.reduce((acc, book) => acc + book.price, 0);
    const avgPrice = totalPrice / books.length;
    return { totalQuantity, totalPrice, avgPrice };
  });

  nextPage(){
    const limit = parseInt(this.#route.snapshot.queryParams['limit']) || 10;
    const skip = parseInt(this.#route.snapshot.queryParams['skip'] || 0) + limit;
    this.#router.navigate([], {relativeTo: this.#route, queryParamsHandling: 'merge', queryParams: {skip, limit}});
  }

  previousPage(){
    const limit = this.#route.snapshot.queryParams['limit'] || 10;
    let skip = (this.#route.snapshot.queryParams['skip'] || 0) - limit;
    skip = skip < 0 ? 0 : skip;
    this.#router.navigate([], {relativeTo: this.#route, queryParamsHandling: 'merge', queryParams: {skip, limit}});
  }
}
