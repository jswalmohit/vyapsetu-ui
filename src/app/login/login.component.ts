import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page d-flex justify-content-center align-items-center py-5">
      <div class="card shadow-sm login-card w-100 mx-3" style="max-width: 420px;">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Login</h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input
                type="text"
                class="form-control"
                formControlName="username"
                [class.is-invalid]="loginForm.controls.username.invalid && loginForm.controls.username.touched"
              />
              <div class="invalid-feedback" *ngIf="loginForm.controls.username.invalid && loginForm.controls.username.touched">
                Username is required.
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                formControlName="password"
                [class.is-invalid]="loginForm.controls.password.invalid && loginForm.controls.password.touched"
              />
              <div class="invalid-feedback" *ngIf="loginForm.controls.password.invalid && loginForm.controls.password.touched">
                Password is required.
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger py-2 mb-3">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary w-100" [disabled]="submitting">
              {{ submitting ? 'Logging in…' : 'Login' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: calc(100vh - 80px);
      }

      .login-card {
        border-radius: 1rem;
      }
    `
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitting = false;
  errorMessage?: string;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = undefined;
    this.submitting = true;

    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.submitting = false;
        this.errorMessage = 'Login failed. Please check your credentials and try again.';
      }
    });
  }
}
