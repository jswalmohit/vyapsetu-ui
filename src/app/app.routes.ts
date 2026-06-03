import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canMatch: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
  },
  {
    path: 'products',
    canMatch: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./product/module/product.module').then((m) => m.ProductModule)
  },
  {
    path: 'customers',
    canMatch: [AuthGuard],
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./customer/customer.module').then((m) => m.CustomerModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
