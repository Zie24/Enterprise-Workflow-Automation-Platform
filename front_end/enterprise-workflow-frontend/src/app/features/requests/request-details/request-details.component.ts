import { Component, OnInit ,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RequestItem,
  RequestService
} from '../../../core/services/request.service';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [RouterLink, DatePipe,FormsModule ],
  templateUrl: './request-details.component.html',
  styleUrl: './request-details.component.css'
})
export class RequestDetailsComponent implements OnInit {

  request: RequestItem | null = null;

  isLoading = false;
  isActionLoading = false;

  errorMessage = '';
  actionMessage = '';
rejectionReason = '';
showRejectForm = false;
  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.loadRequest();
  }

  loadRequest(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Request ID not found.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';


    this.requestService.getRequestById(id)
      .subscribe({

        next: (response) => {

          console.log('Request details:', response);

          this.request = response.request;
          this.isLoading = false;
           this.cdr.detectChanges();

        },

        error: (error) => {

          console.error('Request details error:', error);

          this.errorMessage =
            error.error?.message || 'Failed to load request details';

          this.isLoading = false;
        }

      });
  }

  approveRequest(): void {

    if (!this.request) {
      return;
    }

    this.isActionLoading = true;
    this.actionMessage = '';

    this.requestService.approveRequest(this.request._id)
      .subscribe({

        next: (response) => {

          console.log('Approve response:', response);

          this.request!.status = 'approved';

          this.isActionLoading = false;

          this.actionMessage =
            'Request approved successfully.';
        },

        error: (error) => {

          console.error('Approve error:', error);

          this.isActionLoading = false;

          this.actionMessage =
            error.error?.message ||
            'Failed to approve request.';
        }

      });

  }

rejectRequest(): void {

  if (!this.request) {
    return;
  }

  if (!this.rejectionReason.trim()) {
    this.actionMessage = 'Rejection reason is required.';
    return;
  }

  this.isActionLoading = true;
  this.actionMessage = '';

  this.requestService
    .rejectRequest(this.request._id, this.rejectionReason)
    .subscribe({

      next: (response) => {

        console.log('Reject response:', response);

        this.request!.status = 'rejected';

        this.isActionLoading = false;
        this.showRejectForm = false;
        this.rejectionReason = '';

        this.actionMessage =
          'Request rejected successfully.';
      },

      error: (error) => {

        console.error('Reject error:', error);

        this.isActionLoading = false;

        this.actionMessage =
          error.error?.message ||
          'Failed to reject request.';
      }

    });
}

}
