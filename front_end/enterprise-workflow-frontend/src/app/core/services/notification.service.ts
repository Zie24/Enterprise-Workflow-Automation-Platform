import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  _id: string;
  type: 'new_request' | 'request_approved' | 'request_rejected';
  message: string;
  isRead: boolean;
  request?: {
    _id: string;
    title: string;
    status: string;
  };
  createdAt: string;
}

export interface NotificationResponse {
  count: number;
  unreadCount: number;
  notifications: Notification[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(this.apiUrl);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/read-all`,
      {}
    );
  }
}
