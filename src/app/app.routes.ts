import { Routes } from '@angular/router';
import { MainLayoutVnaccsComponent } from './layouts/main-layout/main-layout.component';
import { ROUTERS } from './shared/constants/router.const';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './modules/vnaccs/login/login.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'vnaccs',
    pathMatch: 'full'
  },
  {
    path: 'vnaccs',
    component: MainLayoutVnaccsComponent,
    children: [
      {path: '', redirectTo: 'home', pathMatch: 'full'},
      {
        path: 'home',
        loadComponent: () =>
          import('./modules/vnaccs/home/home.component').then(
            c => c.HomeComponent
          ),
        // canActivate: [authGuard]
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./modules/vnaccs/login/login.component').then(
            c => c.LoginComponent
          )
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./modules/vnaccs/register/register.component').then(
            c => c.RegisterComponent
          )
      },
      {
        path: 'update-signature',
        loadComponent: () =>
          import('./modules/vnaccs/update-signature/update-signature.component').then(
            c => c.UpdateSignatureComponent
          )
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./modules/vnaccs/change-pass/change-pass.component').then(
            c => c.ChangePassComponent
          )
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./modules/vnaccs/forgot-password/forgot-password.component').then(
            c => c.ForgotPasswordComponent
          )
      }
    ],
  },
  {
    path: '**',
    redirectTo: ROUTERS.HOME_DEFAULT
  },
];
