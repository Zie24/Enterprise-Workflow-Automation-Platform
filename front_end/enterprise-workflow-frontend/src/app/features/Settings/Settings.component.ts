
import {
  Component,
  OnInit,
  inject,
  signal,
  computed
} from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  SettingsService,
  UserSettings
} from '../../core/services/Settings.service';

import {
  Theme,
  ThemeService
} from '../../core/services/Theme.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { API_ORIGIN } from '../../core/config/api.config';

type TabId = 'profile' | 'security' | 'appearance';

interface Notice {
  type: 'success' | 'danger';
  text: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule ,NavBarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {

  private fb = inject(NonNullableFormBuilder);
  private settingsService = inject(SettingsService);

  readonly themeService = inject(ThemeService);
  readonly apiOrigin = API_ORIGIN;

  // Avatar state
  avatarUploading = signal(false);

  // Tabs
  readonly tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'bi-person' },
    { id: 'security', label: 'Security', icon: 'bi-shield-lock' },
    { id: 'appearance', label: 'Appearance', icon: 'bi-palette' },
  ];

  // Themes
  readonly themes: {
    value: Theme;
    label: string;
    icon: string;
  }[] = [
    { value: 'light', label: 'Light', icon: 'bi-sun' },
    { value: 'dark', label: 'Dark', icon: 'bi-moon-stars' },
    { value: 'system', label: 'System', icon: 'bi-circle-half' },
  ];

  // Signals
  activeTab = signal<TabId>('profile');
  settings = signal<UserSettings | null>(null);
  loading = signal(true);
  saving = signal(false);
  notice = signal<Notice | null>(null);

  // Avatar initials when no image exists
  initials = computed(() =>
    (this.settings()?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  );

  // Profile form
  profileForm = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(60)
      ]
    ],
    phone: [''],
    jobTitle: [''],
  });

  // Password form
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  // Password validation
  private get newPassword(): string {
    return this.passwordForm.controls.newPassword.value;
  }

  get hasMinLength() {
    return this.newPassword.length >= 8;
  }

  get hasUppercase() {
    return /[A-Z]/.test(this.newPassword);
  }

  get hasLowercase() {
    return /[a-z]/.test(this.newPassword);
  }

  get hasNumber() {
    return /[0-9]/.test(this.newPassword);
  }

  get hasSpecialChar() {
    return /[^A-Za-z0-9]/.test(this.newPassword);
  }

  get isPasswordValid() {
    return (
      this.hasMinLength &&
      this.hasUppercase &&
      this.hasLowercase &&
      this.hasNumber &&
      this.hasSpecialChar
    );
  }

  // Load settings
  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings.set(data);

        // Share saved avatar with other components
        this.settingsService.setAvatar(data.avatar ?? '');

        this.profileForm.patchValue({
          name: data.name,
          phone: data.phone,
          jobTitle: data.jobTitle,
        });

        // Apply saved theme
        this.themeService.set(data.preferences.theme);

        this.loading.set(false);
      },

      error: () => {
        this.notice.set({
          type: 'danger',
          text: 'Failed to load settings.'
        });

        this.loading.set(false);
      },
    });
  }

  // Select tab
  selectTab(id: TabId): void {
    this.activeTab.set(id);
    this.notice.set(null);
  }

  // Save profile
  saveProfile(): void {
    if (this.profileForm.invalid || this.saving()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.notice.set(null);

    this.settingsService
      .updateProfile(this.profileForm.getRawValue())
      .subscribe({
        next: (res) => {
          this.settings.set(res.settings);
          this.saving.set(false);

          this.notice.set({
            type: 'success',
            text: res.message
          });
        },

        error: (err: HttpErrorResponse) =>
          this.fail(err, 'Failed to update profile.'),
      });
  }

  // Change password
  changePassword(): void {
    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = this.passwordForm.getRawValue();

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.notice.set({
        type: 'danger',
        text: 'Please fill in all fields.'
      });
      return;
    }

    if (!this.isPasswordValid) {
      this.notice.set({
        type: 'danger',
        text: 'The new password does not meet the requirements.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      this.notice.set({
        type: 'danger',
        text: 'Passwords do not match.'
      });
      return;
    }

    if (this.saving()) return;

    this.saving.set(true);
    this.notice.set(null);

    this.settingsService
      .updatePassword(currentPassword, newPassword)
      .subscribe({
        next: (res) => {
          this.passwordForm.reset();
          this.saving.set(false);

          this.notice.set({
            type: 'success',
            text: res.message
          });
        },

        error: (err: HttpErrorResponse) =>
          this.fail(err, 'Failed to change password.'),
      });
  }

  // Select theme
  selectTheme(theme: Theme): void {
    this.themeService.set(theme);

    this.settingsService.updateTheme(theme).subscribe({
      error: () =>
        this.notice.set({
          type: 'danger',
          text: 'Theme applied, but could not be saved to your account.'
        }),
    });
  }

  // Upload avatar
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = '';

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.notice.set({
        type: 'danger',
        text: 'Only JPG, PNG or WebP images are allowed.'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.notice.set({
        type: 'danger',
        text: 'Image must be 2MB or smaller.'
      });
      return;
    }

    this.avatarUploading.set(true);
    this.notice.set(null);

    this.settingsService.uploadAvatar(file).subscribe({
      next: (res) => {
        // Update Settings page
        this.setAvatar(res.avatar);

        // Update shared avatar in the application
        this.settingsService.setAvatar(res.avatar);

        this.avatarUploading.set(false);

        this.notice.set({
          type: 'success',
          text: res.message
        });
      },

      error: (err: HttpErrorResponse) => {
        this.avatarUploading.set(false);

        this.notice.set({
          type: 'danger',
          text: err.error?.message ?? 'Failed to upload photo.'
        });
      },
    });
  }

  // Delete avatar
  removeAvatar(): void {
    if (this.avatarUploading()) return;

    this.avatarUploading.set(true);
    this.notice.set(null);

    this.settingsService.deleteAvatar().subscribe({
      next: (res) => {
        // Update Settings page
        this.setAvatar('');

        // Remove shared avatar from the application
        this.settingsService.setAvatar('');

        this.avatarUploading.set(false);

        this.notice.set({
          type: 'success',
          text: res.message
        });
      },

      error: (err: HttpErrorResponse) => {
        this.avatarUploading.set(false);

        this.notice.set({
          type: 'danger',
          text: err.error?.message ?? 'Failed to remove photo.'
        });
      },
    });
  }

  // Update avatar locally in Settings
  private setAvatar(avatar: string): void {
    this.settings.update((s) =>
      s ? { ...s, avatar } : s
    );
  }

  // Handle errors
  private fail(
    err: HttpErrorResponse,
    fallback: string
  ): void {
    this.saving.set(false);

    this.notice.set({
      type: 'danger',
      text: err.error?.message ?? fallback
    });
  }
}
