import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { authGuard } from '../../../core/auth.guard';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    loadComponent: () =>
    import('./home.component').then(
        (c) => c.HomeComponent
    ),
  },
];
