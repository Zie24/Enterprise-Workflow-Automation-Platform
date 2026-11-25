import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);


  ngOnInit(): void {
  const verified = this.route.snapshot.queryParamMap.get('verified');

  if (verified === 'true') {
    this.successMessage.set('Email verified! You can log in now.');

}
  }

  login(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage.set('Please enter your email and password.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);
    this.authService.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },

      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);

        // الحساب مش متفعل: نوديه لصفحة الـ OTP
        if (error.error?.needsVerification) {
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: error.error.email },
          });
          return;
        }

        this.errorMessage.set(error.error?.message ?? 'Invalid email or password.');
      },
    });
  }
}
