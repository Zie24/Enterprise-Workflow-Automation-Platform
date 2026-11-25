import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  password = '';
  department = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Password UI
  passwordFocused = false;
  passwordsMatch = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Password requirements
  get hasMinLength(): boolean {
    return this.password.length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }

  get hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.password);
  }

  // Check if password satisfies all requirements
  isPasswordValid(): boolean {
    return (
      this.hasMinLength &&
      this.hasUppercase &&
      this.hasLowercase &&
      this.hasNumber &&
      this.hasSpecialChar
    );
  }

  // Check confirm password while typing
  checkPasswordMatch(): void {
    this.passwordsMatch =
      this.password.length > 0 &&
      this.confirmPassword.length > 0 &&
      this.password === this.confirmPassword;
  }

  register(): void {

  // Check empty fields
  if (
    !this.name.trim() ||
    !this.email.trim() ||
    !this.department ||
    !this.password ||
    !this.confirmPassword
  ) {
    this.errorMessage = 'Please fill in all fields.';
    return;
  }

  // Check password requirements
  if (!this.isPasswordValid()) {
    this.errorMessage =
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.';
    return;
  }

  // Check password confirmation
  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match.';
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';
  this.isLoading = true;

  this.authService
    .register(this.name, this.email, this.password, this.department)
    .subscribe({

      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = response.message;

        // نحوّل لصفحة الـ OTP ومعاها الإيميل
        setTimeout(() => {
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: response.email }
          });
        }, 1000);
      },

      error: (error: any) => {
        console.error('Register error:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed.';
      }

    });
}
  

}
