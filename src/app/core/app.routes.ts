import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LayoutComponent } from '../shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('../features/home/home.component'),
      },
      {
        path: 'books',
        loadChildren: () =>
          import('../features/books/books.routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('../features/login/login.component'),
  },
  {
    path: 'signup',
    loadComponent: () => import('../features/signup/signup.component'),
  }
];
