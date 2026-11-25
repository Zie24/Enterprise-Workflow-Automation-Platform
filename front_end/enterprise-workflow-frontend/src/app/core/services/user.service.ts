import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

export interface EmployeesResponse {
  count: number;
  employees: Employee[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<EmployeesResponse> {

    return this.http.get<EmployeesResponse>(
      `${this.apiUrl}/employees`
    );

  }

}
