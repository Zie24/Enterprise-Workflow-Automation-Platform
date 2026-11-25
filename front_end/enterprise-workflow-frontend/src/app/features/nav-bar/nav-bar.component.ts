import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink ,RouterLinkActive} from '@angular/router';
import { ThemeService } from '../../core/services/Theme.service';
import { SettingsService } from '../../core/services/Settings.service';
import { API_ORIGIN } from '../../core/config/api.config';

import {
  NotificationService,
  Notification
} from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, DatePipe ,RouterLinkActive ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {

  private notificationService = inject(NotificationService);
  private router = inject(Router);

  readonly settingsService = inject(SettingsService);
  readonly themeService = inject(ThemeService);
  readonly apiOrigin = API_ORIGIN;

  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;

  ngOnInit(): void {
    this.loadNotifications();
    this.loadProfileAvatar();
  }

  // Load profile avatar
  loadProfileAvatar(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settingsService.setAvatar(data.avatar ?? '');
      },
      error: (err) => {
        console.error('Failed to load profile avatar:', err);
      }
    });
  }

  // Load notifications
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        this.unreadCount = response.unreadCount;
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
      }
    });
  }

  // Toggle notifications dropdown
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // Mark one notification as read
  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.isRead = true;

        if (this.unreadCount > 0) {
          this.unreadCount--;
        }
      },
      error: (error) => {
        console.error('Failed to mark notification as read:', error);
      }
    });
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(
          notification => notification.isRead = true
        );

        this.unreadCount = 0;
      },
      error: (error) => {
        console.error('Failed to mark all notifications as read:', error);
      }
    });
  }

  // Toggle theme
  toggleTheme(): void {
    const next = this.themeService.isDark() ? 'light' : 'dark';

    this.themeService.set(next);

    this.settingsService.updateTheme(next).subscribe({
      error: () => {}
    });
  }

  // Logout
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
