import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';

import {
  Task,
  TaskService
} from '../../core/services/task.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.css'
})
export class TaskDetailsComponent implements OnInit {

  task: Task | null = null;

  currentUserRole = '';

  isLoading = true;
  isActionLoading = false;

  errorMessage = '';
  actionMessage = '';

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadTask();
  }

  getCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.currentUserRole = response.user.role;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to get current user:', error);
      }
    });
  }

  loadTask(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Task ID not found.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        this.task = response.task;
        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Task details error:', error);

        this.errorMessage =
          error.error?.message ||
          'Failed to load task details.';

        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
  }

  startTask(): void {
    if (!this.task) {
      return;
    }

    this.isActionLoading = true;
    this.actionMessage = '';

    this.taskService.startTask(this.task._id).subscribe({
      next: (response) => {
        this.task = response.task;
        this.isActionLoading = false;

        this.actionMessage = 'Task started successfully.';

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Start task error:', error);

        this.isActionLoading = false;

        this.actionMessage =
          error.error?.message ||
          'Failed to start task.';

        this.cdr.detectChanges();
      }
    });
  }

  completeTask(): void {
    if (!this.task) {
      return;
    }

    this.isActionLoading = true;
    this.actionMessage = '';

    this.taskService.completeTask(this.task._id).subscribe({
      next: (response) => {
        this.task = response.task;
        this.isActionLoading = false;

        this.actionMessage =
          'Task completed successfully.';

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Complete task error:', error);

        this.isActionLoading = false;

        this.actionMessage =
          error.error?.message ||
          'Failed to complete task.';

        this.cdr.detectChanges();
      }
    });
  }
}
