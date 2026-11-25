import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  CreateRequestData,
  RequestService
} from '../../../core/services/request.service';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.css'
})
export class CreateRequestComponent {

  request: CreateRequestData = {
    title: '',
    description: '',
    priority: '',
    department: ''
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private requestService: RequestService,
    private router: Router
  ) {}

  createRequest(): void {
    if (
      !this.request.title.trim() ||
      !this.request.description.trim() ||
      !this.request.priority ||
      !this.request.department
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.requestService.createRequest(this.request)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.isLoading = false;

          this.request = {
            title: '',
            description: '',
            priority: '',
            department: ''
          };

          setTimeout(() => {
            this.router.navigate(['/requests']);
          }, 1000);
        },

        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Failed to create request';

          this.isLoading = false;
        }
      });
  }
}
