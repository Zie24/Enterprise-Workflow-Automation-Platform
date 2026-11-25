import { HttpClient } from '@angular/common/http';
import { Injectable, inject ,signal  } from '@angular/core';
import { Theme } from './Theme.service';

export interface UserSettings {
  avatar: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  jobTitle: string;
  preferences: { theme: Theme };
}

export interface ProfileData {
  name: string;
  phone: string;
  jobTitle: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/settings';

  getSettings() {
    return this.http.get<UserSettings>(this.api);
  }

  // ضيفي الدالتين دول جوه SettingsService (جنب updateTheme)


uploadAvatar(file: File) {
  const form = new FormData();
  form.append('avatar', file);
  // من غير ما تحطي Content-Type بنفسك: المتصفح بيحطه مع الـ boundary
  return this.http.post<{ message: string; avatar: string }>(`${this.api}/avatar`, form);
}

deleteAvatar() {
  return this.http.delete<{ message: string; avatar: string }>(`${this.api}/avatar`);
}
avatar = signal<string>('');

setAvatar(value: string) {
  this.avatar.set(value);
}
// وفي interface UserSettings ضيفي:
//   avatar: string;
  updateProfile(data: ProfileData) {
    return this.http.patch<{ message: string; settings: UserSettings }>(
      `${this.api}/profile`,
      data
    );
  }

  updatePassword(currentPassword: string, newPassword: string) {
    return this.http.patch<{ message: string; token: string }>(
      `${this.api}/password`,
      { currentPassword, newPassword }
    );
  }

  updateTheme(theme: Theme) {
    return this.http.patch<{ message: string }>(`${this.api}/preferences`, { theme });
  }
}
