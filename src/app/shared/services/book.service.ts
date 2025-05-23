import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Book} from '../interfaces/book.interface';

@Injectable({providedIn: 'root'})
export class BookService {
  readonly #http = inject(HttpClient);

  getBooks(limit: number, skip: number, title?: string, sort?: string) {
    const params: any = { limit, skip };
    if (title) params.title = title;
    if (sort) params.sort = sort;
    return this.#http.get<Book[]>('/api/books', { params });
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

  addReviews(review: { bookId:string, user:string, message:string, rating:number }) {
    return this.#http.post<Book>('/api/books/reviews', {...review});
  }
}
