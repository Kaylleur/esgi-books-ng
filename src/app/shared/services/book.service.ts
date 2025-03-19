import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../interfaces/book.interface';
import { delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookService {
  readonly #http = inject(HttpClient);

  getBooks() {
    return this.#http.get<Book[]>('/api/books').pipe(delay(1000));
  }

  getBook(id: number) {
    return this.#http.get<Book>('/api/books/' + id).pipe(delay(1000));
  }

  createBook(value: Omit<Book, 'id'>) {
    return this.#http.post<Book>('/api/books', value).pipe(delay(1000));
  }

  updateBook(id: number, value: Omit<Book, 'id'>) {
    return this.#http.put<Book>('/api/books/' + id, value).pipe(delay(1000));
  }
}
