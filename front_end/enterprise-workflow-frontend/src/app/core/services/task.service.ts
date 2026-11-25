import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskRequest {
  _id: string;
  title: string;
  status: string;
  priority: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;

  status: 'todo' | 'in_progress' | 'completed';

  priority: 'low' | 'medium' | 'high' | 'urgent';

  assignee: TaskUser;

  assignedBy: TaskUser;

  request?: TaskRequest | null;

  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  count: number;
  tasks: Task[];
}

export interface CreateTaskData {
  title: string;
  description: string;

  // Optional
  requestId?: string;

  assignee: string;

  priority: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(this.apiUrl);
  }

  getTaskById(id: string): Observable<{ task: Task }> {
    return this.http.get<{ task: Task }>(
      `${this.apiUrl}/${id}`
    );
  }

  startTask(id: string): Observable<{ message: string; task: Task }> {
    return this.http.patch<{ message: string; task: Task }>(
      `${this.apiUrl}/${id}/start`,
      {}
    );
  }

  completeTask(id: string): Observable<{ message: string; task: Task }> {
    return this.http.patch<{ message: string; task: Task }>(
      `${this.apiUrl}/${id}/complete`,
      {}
    );
  }

  createTask(
    data: CreateTaskData
  ): Observable<{ message: string; task: Task }> {

    return this.http.post<{ message: string; task: Task }>(
      this.apiUrl,
      data
    );
  }
}
