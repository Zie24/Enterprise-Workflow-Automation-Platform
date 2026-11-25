import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtpService } from '../../../core/services/otp.service';

const CODE_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css',
})
export class VerifyOtpComponent implements OnInit {
  private otpService = inject(OtpService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  // كل الـ inputs اللي عليها #otpInput في الـ HTML
  private inputs = viewChildren<ElementRef<HTMLInputElement>>('otpInput');

  readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';

  // a***@gmail.com
  readonly maskedEmail = (() => {
    const [name, domain] = this.email.split('@');
    return domain ? `${name.charAt(0)}***@${domain}` : this.email;
  })();

  digits = signal<string[]>(Array(CODE_LENGTH).fill(''));
  error = signal('');
  success = signal('');
  loading = signal(false);
  cooldown = signal(COOLDOWN_SECONDS);

  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    // تنظيف العداد لما الـ component يتشال
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  ngOnInit(): void {
    if (!this.email) {
      this.router.navigate(['/login']);
      return;
    }

    this.startCooldown();
    setTimeout(() => this.focusInput(0));
  }

  private focusInput(index: number): void {
    this.inputs()[index]?.nativeElement.focus();
  }

  private emptyDigits(): string[] {
    return Array(CODE_LENGTH).fill('');
  }

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    this.digits.update((arr) => {
      const copy = [...arr];
      copy[index] = digit;
      return copy;
    });

    input.value = digit;
    this.error.set('');

    if (digit && index < CODE_LENGTH - 1) {
      this.focusInput(index + 1);
    }

    if (this.digits().every(Boolean)) {
      this.submit();
    }
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits()[index] && index > 0) {
      this.focusInput(index - 1);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const text = (event.clipboardData?.getData('text') ?? '')
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH);

    if (!text) return;

    const arr = this.emptyDigits();
    [...text].forEach((char, i) => (arr[i] = char));
    this.digits.set(arr);

    this.focusInput(Math.min(text.length, CODE_LENGTH - 1));

    if (text.length === CODE_LENGTH) {
      this.submit();
    }
  }

  submit(): void {
    if (this.loading()) return;

    const code = this.digits().join('');

    if (code.length < CODE_LENGTH) {
      this.error.set('Enter the 6-digit code');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.otpService.verify(this.email, code, 'verify_email').subscribe({
      next: () => {
        this.success.set('Email verified! Redirecting to login...');
        setTimeout(
          () => this.router.navigate(['/login'], { queryParams: { verified: true } }),
          1200
        );
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'Something went wrong');
        this.loading.set(false);
        this.digits.set(this.emptyDigits());
        this.focusInput(0);
      },
    });
  }

  resend(): void {
    if (this.cooldown() > 0) return;

    this.error.set('');

    this.otpService.send(this.email, 'verify_email').subscribe({
      next: () => {
        this.success.set('A new code has been sent');
        setTimeout(() => this.success.set(''), 3000);
        this.startCooldown();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'Failed to resend');
      },
    });
  }

  private startCooldown(): void {
    this.cooldown.set(COOLDOWN_SECONDS);
    clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.cooldown.update((v) => v - 1);
      if (this.cooldown() <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }
}
