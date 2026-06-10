import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OAuthHelper } from '../../../core/services/oauth.helper';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {
  registerForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;
  activeModule: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' = 'STUDENT';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private oauthHelper: OAuthHelper,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$/)
      ]],
      role: ['STUDENT', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngAfterViewInit() {
    this.oauthHelper.initializeGoogleSignIn('YOUR_GOOGLE_CLIENT_ID', (response) => {
      this.handleGoogleLogin(response.credential);
    });
    this.oauthHelper.renderGoogleButton('google-btn-register');
    this.oauthHelper.initializeFacebookSignIn('YOUR_FACEBOOK_APP_ID');
  }

  handleGoogleLogin(token: string) {
    this.isLoading = true;
    this.error = '';
    this.authService.loginWithGoogle(token, this.activeModule).subscribe({
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

  handleFacebookLogin() {
    this.oauthHelper.loginWithFacebook((response) => {
      if (response && response.authResponse) {
        this.isLoading = true;
        this.error = '';
        this.authService.loginWithFacebook(response.authResponse.accessToken, this.activeModule).subscribe({
          next: (res) => {
            this.isLoading = false;
            const role = res.user?.role || res.role;
            if (role === 'INSTRUCTOR') {
              this.router.navigate(['/instructor']);
            } else if (role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => {
            this.error = err.error?.error || 'Facebook login failed';
            this.isLoading = false;
          }
        });
      } else {
        this.error = 'Facebook login was cancelled or failed';
      }
    });
  }

  setModule(module: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
    this.activeModule = module;
    this.registerForm.patchValue({ role: module });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      const { agreeTerms, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response && response.token) {
            // authService already sets the user and token via tap
            const role = response.user?.role || response.role;
            if (role === 'INSTRUCTOR') {
              this.router.navigate(['/instructor']);
            } else if (role === 'ADMIN') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.router.navigate(['/login'], {
              queryParams: { registered: 'true' }
            });
          }
        },
        error: (err) => {
          if (err.status === 0) {
            this.error = 'Unable to connect to the server. Is the backend running?';
          } else {
            this.error = err.error?.error || err.error?.message || 'Registration failed. Please try again.';
          }
          this.isLoading = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
