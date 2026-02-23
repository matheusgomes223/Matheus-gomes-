import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  notificationService = inject(NotificationService);
  menuOpen = false;
  notificationsOpen = false;
  
  sidebarItems = [
    { label: 'Dashboard', shortLabel: 'Dash', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', link: '/dashboard' },
    { label: 'Movimentações', shortLabel: 'Movim.', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', link: '/movements' },
    { label: 'Estoque', shortLabel: 'Estoque', icon: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z', link: '/inventory' },
    { label: 'Pedidos', shortLabel: 'Pedidos', icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z', link: '/orders' },
    { label: 'Relatórios', shortLabel: 'Relat.', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z', link: '/reports' },
  ];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      // Optional: Mark all as read when opening? Or let user click individual ones.
      // this.notificationService.markAllAsRead();
    }
  }

  closeNotifications() {
    this.notificationsOpen = false;
  }
  
  // Helper to close when clicking outside (simple version)
  onBackdropClick() {
    if (this.notificationsOpen) {
      this.closeNotifications();
    }
  }
}