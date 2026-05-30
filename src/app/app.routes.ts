import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./product/product.module').then((m) => m.ProductModule)
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./customer/customer.module').then((m) => m.CustomerModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
