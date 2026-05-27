import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',           redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview',   loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent) },
  { path: 'review',     loadComponent: () => import('./pages/review/review.component').then(m => m.ReviewComponent) },
  { path: 'feed',       loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent) },
  { path: 'analytics',  loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
  { path: 'audit',      loadComponent: () => import('./pages/audit/audit.component').then(m => m.AuditComponent) },
  { path: 'settings',   loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
  { path: '**',         redirectTo: 'overview' },
];
