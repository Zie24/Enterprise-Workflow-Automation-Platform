import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface RequestUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface RequestItem {
  _id: string;
  title: string;
  description: string;
  priority: string;
  department: string;
  status: string;

  requester: RequestUser;

  approver?: RequestUser | null;

  rejectionReason?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface RequestsResponse {
  count: number;
  requests: RequestItem[];
}

export interface CreateRequestData {
  title: string;
  description: string;
  priority: string;
  department: string;
}


@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private apiUrl = 'http://localhost:3000/requests';

  constructor(private http: HttpClient) {}

  getRequests(): Observable<RequestsResponse> {
    return this.http.get<RequestsResponse>(this.apiUrl);
  }

  getRequestById(id: string): Observable<{ request: RequestItem }> {
    return this.http.get<{ request: RequestItem }>(
      `${this.apiUrl}/${id}`
    );
  }
  createRequest(data: CreateRequestData): Observable<{ message: string; request: RequestItem }> {
  return this.http.post<{ message: string; request: RequestItem }>(
    this.apiUrl,
    data
  );
}
approveRequest(id: string): Observable<any> {
  return this.http.patch(
    `${this.apiUrl}/${id}/approve`,
    {}
  );
}
rejectRequest(id: string, rejectionReason: string): Observable<any> {
  return this.http.patch(
    `${this.apiUrl}/${id}/reject`,
    { rejectionReason }
  );
}
}


