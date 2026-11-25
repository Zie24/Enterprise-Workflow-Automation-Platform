import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import {
  TeamService,
  TeamMember
} from '../../core/services/team.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent implements OnInit {

  members: TeamMember[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private teamService: TeamService,
    private cdr :ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getTeams().subscribe({

      next: (response) => {
        this.members = response.users;
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load teams:', error);

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to load team members.';
      }

    });
  }
}
