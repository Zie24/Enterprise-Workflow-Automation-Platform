import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.readStored());
  readonly isDark = signal(false);

  private media = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.apply();

    // لو الاختيار System ونظام التشغيل غيّر الوضع، نتبعه
    this.media.addEventListener('change', () => {
      if (this.theme() === 'system') this.apply();
    });
  }

  set(theme: Theme): void {
    this.theme.set(theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // التخزين غير متاح، نكمل من غير حفظ
    }

    this.apply();
  }

  private apply(): void {
    const dark =
      this.theme() === 'dark' || (this.theme() === 'system' && this.media.matches);

    this.isDark.set(dark);
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');

    // جسر مؤقت: الصفحات اللي لسه فيها body.dark-mode تفضل شغالة لحد ما تتحول
    // لـ variables. امسحي السطر ده بعد ما تخلصي التحويل.
    document.body.classList.toggle('dark-mode', dark);
  }

  private readStored(): Theme {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (value === 'light' || value === 'dark' || value === 'system') return value;
    } catch {
      // نرجع للافتراضي
    }
    return 'system';
  }
}
