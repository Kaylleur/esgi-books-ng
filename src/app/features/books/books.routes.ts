import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: BookListComponent,
  },
  {
    path: 'new',
    component: BookDetailComponent,
  },
  {
    path: ':bookId',
    component: BookDetailComponent,
  },
];
