import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isActive: boolean;
}

export interface TeamsResponse {
  count: number;
  users: TeamMember[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private apiUrl = 'http://localhost:3000/teams';

  constructor(private http: HttpClient) {}

  getTeams(): Observable<TeamsResponse> {
    return this.http.get<TeamsResponse>(this.apiUrl);
  }
}
