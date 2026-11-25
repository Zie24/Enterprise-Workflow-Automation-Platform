import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterLink
} from '@angular/router';

import {
  DatePipe,
  TitleCasePipe
} from '@angular/common';

import {
  Task,
  TaskService,
  CreateTaskData
} from '../../core/services/task.service';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  UserService,
  Employee
} from '../../core/services/user.service';

import {
  RequestService,
  RequestItem
} from '../../core/services/request.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    FormsModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {

  tasks: Task[] = [];

  currentUserRole = '';

  showCreateForm = false;
  isLoading = true;
  isCreatingTask = false;
  errorMessage = '';
  createTaskError = '';
  createTaskSuccess = '';

  employees: Employee[] = [];
  approvedRequests: RequestItem[] = [];

  taskForm = {
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    requestId: ''
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private userService: UserService,
    private requestService: RequestService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadTasks();
  }

  // =========================
  // Current User
  // =========================

  getCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (response) => {

        this.currentUserRole = response.user.role;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Failed to get current user:',
          error
        );
      }
    });
  }

  // =========================
  // Load Tasks
  // =========================

  loadTasks(): void {

    this.taskService.getTasks().subscribe({
      next: (response) => {

        this.tasks = response.tasks;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load tasks:',
          error
        );

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Failed to load tasks.';

        this.cdr.detectChanges();
      }
    });
  }

  // =========================
  // Open Create Form
  // =========================

  openCreateTask(): void {

    this.showCreateForm = true;

    this.createTaskError = '';
    this.createTaskSuccess = '';

    this.loadEmployees();
    this.loadApprovedRequests();
  }

  // =========================
  // Close Create Form
  // =========================

  closeCreateTask(): void {

    this.showCreateForm = false;

    this.resetTaskForm();

    this.createTaskError = '';
    this.createTaskSuccess = '';
  }

  // =========================
  // Load Employees
  // =========================

  loadEmployees(): void {

    this.userService.getEmployees().subscribe({
      next: (response) => {

        this.employees = response.employees;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load employees:',
          error
        );

        this.createTaskError =
          error.error?.message ||
          'Failed to load employees.';
      }
    });
  }

  // =========================
  // Load Approved Requests
  // =========================

  loadApprovedRequests(): void {

    this.requestService.getRequests().subscribe({
      next: (response) => {

        this.approvedRequests =
          response.requests.filter(
            request => request.status === 'approved'
          );

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load requests:',
          error
        );

        this.createTaskError =
          error.error?.message ||
          'Failed to load requests.';
      }
    });
  }

  // =========================
  // Create Task
  // =========================

  createTask(): void {

    this.createTaskError = '';
    this.createTaskSuccess = '';

    if (!this.taskForm.title.trim()) {

      this.createTaskError =
        'Task title is required.';

      return;
    }

    if (!this.taskForm.assignee) {

      this.createTaskError =
        'Please select an employee.';

      return;
    }

    const taskData: CreateTaskData = {
      title: this.taskForm.title.trim(),

      description:
        this.taskForm.description.trim(),

      assignee: this.taskForm.assignee,

      priority: this.taskForm.priority
    };

    // Request is optional
    if (this.taskForm.requestId) {
      taskData.requestId =
        this.taskForm.requestId;
    }

    this.isCreatingTask = true;

    this.taskService.createTask(taskData).subscribe({

      next: (response) => {

        console.log(
          'Task created:',
          response
        );

        this.isCreatingTask = false;

        this.createTaskSuccess =
          'Task created and assigned successfully.';

        this.resetTaskForm();

        this.loadTasks();

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Create task error:',
          error
        );

        this.isCreatingTask = false;

        this.createTaskError =
          error.error?.message ||
          'Failed to create task.';

        this.cdr.detectChanges();
      }

    });
  }

  // =========================
  // Reset Form
  // =========================

  resetTaskForm(): void {

    this.taskForm = {
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      requestId: ''
    };
  }
}
