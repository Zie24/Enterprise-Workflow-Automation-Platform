
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/Settings.service';
import { API_ORIGIN } from '../../core/config/api.config';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {

  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  readonly settingsService = inject(SettingsService);
  readonly apiOrigin = API_ORIGIN;

  user: User | null = null;

  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.authService.getCurrentUser().subscribe({

      next: (response) => {
        this.user = response.user;
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load user:', error);

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to load account information.';

        this.cdr.detectChanges();
      }

    });
  }
}
