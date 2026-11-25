import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export type OtpPurpose = 'verify_email' | 'reset_password' | 'login_2fa';

export interface OtpMessageResponse {
  message: string;
}

export interface OtpVerifyResponse extends OtpMessageResponse {
  resetToken?: string;
}

@Injectable({ providedIn: 'root' })
export class OtpService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/otp';

  send(email: string, purpose: OtpPurpose) {
    return this.http.post<OtpMessageResponse>(`${this.api}/send`, { email, purpose });
  }

  verify(email: string, otp: string, purpose: OtpPurpose) {
    return this.http.post<OtpVerifyResponse>(`${this.api}/verify`, { email, otp, purpose });
  }
}
