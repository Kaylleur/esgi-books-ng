import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Book} from '../interfaces/book.interface';

@Injectable({providedIn: 'root'})
export class BookService {
  readonly #http = inject(HttpClient);

  getBooks(limit = 10, skip = 0) {
    return this.#http.get<Book[]>('/api/books', {
      params: {
        skip, limit
      }
    });
  }

  getBook(id: number) {
    return this.#http.get<Book>('/api/books/' + id);
  }

  createBook(value: Omit<Book, 'id'>) {
    return this.#http.post<Book>('/api/books', value);
  }

  updateBook(id: number, value: Omit<Book, 'id'>) {
    return this.#http.put<Book>('/api/books/' + id, value);
  }
}
