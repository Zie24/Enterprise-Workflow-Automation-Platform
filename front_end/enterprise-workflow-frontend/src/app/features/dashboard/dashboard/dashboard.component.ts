import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import {
  RequestService,
  RequestItem
} from '../../../core/services/request.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  currentUserRole = '';

  isLoading = true;
  errorMessage = '';

  // Statistics
  firstStatLabel = '';
  secondStatLabel = '';
  thirdStatLabel = '';
  fourthStatLabel = '';

  firstStatCount = 0;
  secondStatCount = 0;
  thirdStatCount = 0;
  fourthStatCount = 0;

  // Recent requests
  recentRequests: RequestItem[] = [];

  constructor(
    private authService: AuthService,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.authService.getCurrentUser().subscribe({
      next: (response) => {

        this.currentUserRole = response.user.role;

        this.loadRequests();
      },

      error: (error) => {

        console.error(
          'Failed to load current user:',
          error
        );

        this.errorMessage =
          'Failed to load dashboard.';
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });

  }

  loadRequests(): void {

    this.requestService.getRequests().subscribe({
      next: (response) => {

        const requests = response.requests;

        this.setStatistics(requests);

        // Latest 3 requests
        this.recentRequests = [...requests]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 3);

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load requests:',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Failed to load requests.';

        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });

  }

  setStatistics(requests: RequestItem[]): void {

    const approvedCount =
      requests.filter(
        request => request.status === 'approved'
      ).length;

    const rejectedCount =
      requests.filter(
        request => request.status === 'rejected'
      ).length;

    const submittedCount =
      requests.filter(
        request =>
          request.status === 'submitted' ||
          request.status === 'pending'
      ).length;

    // Employee dashboard
    if (this.currentUserRole === 'employee') {

      this.firstStatLabel = 'My Requests';
      this.secondStatLabel = 'Submitted';
      this.thirdStatLabel = 'Approved';
      this.fourthStatLabel = 'Rejected';

      this.firstStatCount = requests.length;
      this.secondStatCount = submittedCount;
      this.thirdStatCount = approvedCount;
      this.fourthStatCount = rejectedCount;

      return;
    }

    // Manager dashboard
    if (this.currentUserRole === 'manager') {

      this.firstStatLabel = 'Total Requests';
      this.secondStatLabel = 'Pending Approval';
      this.thirdStatLabel = 'Approved';
      this.fourthStatLabel = 'Rejected';

      this.firstStatCount = requests.length;
      this.secondStatCount = submittedCount;
      this.thirdStatCount = approvedCount;
      this.fourthStatCount = rejectedCount;

      return;
    }

    // Admin dashboard
    if (this.currentUserRole === 'admin') {

      this.firstStatLabel = 'Total Requests';
      this.secondStatLabel = 'Pending Approval';
      this.thirdStatLabel = 'Approved';
      this.fourthStatLabel = 'Rejected';

      this.firstStatCount = requests.length;
      this.secondStatCount = submittedCount;
      this.thirdStatCount = approvedCount;
      this.fourthStatCount = rejectedCount;
    }

  }

}
