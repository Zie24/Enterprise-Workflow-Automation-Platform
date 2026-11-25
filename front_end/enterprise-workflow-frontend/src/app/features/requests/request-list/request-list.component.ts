import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  RequestItem,
  RequestService
} from '../../../core/services/request.service';

import { AuthService } from '../../../core/services/auth.service';

import {
  TaskService,
  CreateTaskData
} from '../../../core/services/task.service';

import {
  UserService,
  Employee
} from '../../../core/services/user.service';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    RouterLink,
    TitleCasePipe,
    FormsModule
  ],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.css'
})
export class RequestListComponent implements OnInit {

  requests: RequestItem[] = [];

  isLoading = false;
  errorMessage = '';

  isManager = false;

  actionLoading: string | null = null;


  // =========================
  // Assign Task
  // =========================

  showAssignModal = false;

  selectedRequest: RequestItem | null = null;

  employees: Employee[] = [];
  isLoadingEmployees = false;

  taskTitle = '';
  taskDescription = '';
  selectedEmployee = '';
  taskPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

  isAssigningTask = false;
  taskError = '';
  taskSuccess = '';


  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private taskService: TaskService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.loadCurrentUser();
    this.loadRequests();

  }


  // =========================
  // Current User
  // =========================

  loadCurrentUser(): void {

    this.authService.getCurrentUser().subscribe({

      next: (response) => {

        this.isManager =
          response.user.role === 'manager';

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Failed to load current user:',
          error
        );

      }

    });

  }


  // =========================
  // Load Requests
  // =========================

  loadRequests(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.requestService.getRequests().subscribe({

      next: (response) => {

        this.requests = response.requests;

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Requests error:',
          error
        );

        this.errorMessage =
          error.error?.message ||
          'Failed to load requests';

        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });

  }


  // =========================
  // Approve
  // =========================

  approveRequest(requestId: string): void {

    this.actionLoading = requestId;
    this.errorMessage = '';

    this.requestService
      .approveRequest(requestId)
      .subscribe({

        next: () => {

          const request =
            this.requests.find(
              item => item._id === requestId
            );

          if (request) {
            request.status = 'approved';
          }

          this.actionLoading = null;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Approve request error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to approve request.';

          this.actionLoading = null;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // Reject
  // =========================

  rejectRequest(requestId: string): void {

    const rejectionReason =
      window.prompt(
        'Please enter a rejection reason:'
      );

    if (!rejectionReason?.trim()) {
      return;
    }

    this.actionLoading = requestId;
    this.errorMessage = '';

    this.requestService
      .rejectRequest(
        requestId,
        rejectionReason.trim()
      )
      .subscribe({

        next: () => {

          const request =
            this.requests.find(
              item => item._id === requestId
            );

          if (request) {
            request.status = 'rejected';
          }

          this.actionLoading = null;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Reject request error:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Failed to reject request.';

          this.actionLoading = null;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // Open Assign Modal
  // =========================

  openAssignTask(request: RequestItem): void {

    this.selectedRequest = request;

    this.taskTitle = request.title;
    this.taskDescription = request.description;
    this.selectedEmployee = '';
    this.taskPriority =
      request.priority as 'low' | 'medium' | 'high' | 'urgent';

    this.taskError = '';
    this.taskSuccess = '';

    this.showAssignModal = true;

    this.loadEmployees();

  }


  // =========================
  // Load Employees
  // =========================

  loadEmployees(): void {

    this.isLoadingEmployees = true;

    this.userService
      .getEmployees()
      .subscribe({

        next: (response) => {

          this.employees = response.employees;

          this.isLoadingEmployees = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Failed to load employees:',
            error
          );

          this.taskError =
            error.error?.message ||
            'Failed to load employees.';

          this.isLoadingEmployees = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // Assign Task
  // =========================

  assignTask(): void {

    if (!this.selectedRequest) {
      return;
    }

    if (!this.taskTitle.trim()) {

      this.taskError =
        'Please enter a task title.';

      return;

    }

    if (!this.selectedEmployee) {

      this.taskError =
        'Please select an employee.';

      return;

    }

    this.taskError = '';
    this.taskSuccess = '';
    this.isAssigningTask = true;


    const taskData: CreateTaskData = {

      title: this.taskTitle.trim(),

      description:
        this.taskDescription.trim(),

      requestId:
        this.selectedRequest._id,

      assignee:
        this.selectedEmployee,

      priority:
        this.taskPriority

    };


    this.taskService
      .createTask(taskData)
      .subscribe({

        next: (response) => {

          console.log(
            'Task created successfully:',
            response
          );

          this.taskSuccess =
            'Task assigned successfully.';

          this.isAssigningTask = false;

          this.cdr.detectChanges();


          setTimeout(() => {

            this.closeAssignModal();

          }, 1000);

        },

        error: (error) => {

          console.error(
            'Create task error:',
            error
          );

          this.taskError =
            error.error?.message ||
            'Failed to assign task.';

          this.isAssigningTask = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================
  // Close Modal
  // =========================

  closeAssignModal(): void {

    if (this.isAssigningTask) {
      return;
    }

    this.showAssignModal = false;

    this.selectedRequest = null;

    this.taskTitle = '';
    this.taskDescription = '';
    this.selectedEmployee = '';
    this.taskPriority = 'medium';

    this.taskError = '';
    this.taskSuccess = '';

  }


  // =========================
  // Action Loading
  // =========================

  isActionLoading(requestId: string): boolean {

    return this.actionLoading === requestId;

  }

}
