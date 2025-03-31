import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RowComponent } from './row/row.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BookService } from '../../../shared/services/book.service';

@Component({
  selector: 'app-book-list',
  imports: [CurrencyPipe, DecimalPipe, RowComponent, RouterLink],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BookListComponent {
  readonly #bookService = inject(BookService);
  readonly books = toSignal(this.#bookService.getBooks());

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
}
