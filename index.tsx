
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { Routes } from '@angular/router';

import { DashboardComponent } from './src/components/dashboard.component';
import { InventoryComponent } from './src/components/inventory.component';
import { MovementsComponent } from './src/components/movements.component';
import { OrdersComponent } from './src/components/orders.component';
import { ReportsComponent } from './src/components/reports.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'movements', component: MovementsComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'reports', component: ReportsComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
