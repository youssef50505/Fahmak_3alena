import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OAuthHelper } from '../../../core/services/oauth.helper';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;
  activeModule: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' = 'STUDENT';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthHelper: OAuthHelper,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngAfterViewInit() {
    this.oauthHelper.initializeGoogleSignIn('YOUR_GOOGLE_CLIENT_ID', (response) => {
      this.handleGoogleLogin(response.credential);
    });
    this.oauthHelper.renderGoogleButton('google-btn-login');
  }

  handleGoogleLogin(token: string) {
    this.isLoading = true;
    this.error = '';
    this.authService.loginWithGoogle(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        const role = response.user?.role || response.role;
        if (role === 'INSTRUCTOR') {
          this.router.navigate(['/instructor']);
        } else if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'Google login failed';
        this.isLoading = false;
      }
    });
  }

  setModule(module: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
    this.activeModule = module;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          const role = response.user?.role || response.role;
          if (role === 'INSTRUCTOR') {
            this.router.navigate(['/instructor']);
          } else if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          if (err.status === 0) {
            this.error = 'Unable to connect to the server. Is the backend running?';
          } else {
            this.error = typeof err.error === 'string' ? err.error : (err.error?.message || 'Invalid credentials');
          }
          this.isLoading = false;
        }
      });
    }
  }
}

