import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/catalog/dashboard/dashboard.component').then(m => m.DashboardComponent) },

  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', canActivate: [guestGuard], loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent) },

  // Protected (auth)
  { path: 'cart', canActivate: [authGuard], loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./features/orders/my-orders.component').then(m => m.MyOrdersComponent) },

  // Admin (auth + admin)
  { path: 'admin', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/products-list/admin-products-list.component').then(m => m.AdminProductsListComponent) },

  //  Admin Analytics
  { path: 'admin/analytics', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/adminanalytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },

  { path: 'product/:id', loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },

  { path: 'admin/add', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/product-form/admin-product-form.component').then(m => m.AdminProductFormComponent) },
  { path: 'admin/edit/:id', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/product-form/admin-product-form.component').then(m => m.AdminProductFormComponent) },

  { path: '**', redirectTo: '' }
];
