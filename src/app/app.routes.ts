import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/book-list/book-list').then((m) => m.BookListComponent),
  },
  {
    path: 'book/:id',
    loadComponent: () =>
      import('./components/book-details/book-details').then((m) => m.BookDetailsComponent),
  },
  { path: '**', redirectTo: '' },
];
