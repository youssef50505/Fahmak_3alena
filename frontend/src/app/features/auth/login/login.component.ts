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
    this.oauthHelper.initializeFacebookSignIn('YOUR_FACEBOOK_APP_ID');
  }

  handleGoogleLogin(token: string) {
    this.isLoading = true;
    this.error = '';
    this.authService.loginWithGoogle(token, this.activeModule).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.redirectBasedOnRole(response.user?.role || response.role);
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
            this.redirectBasedOnRole(res.user?.role || res.role);
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
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.redirectBasedOnRole(response.user?.role || response.role);
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

  private redirectBasedOnRole(role: string) {
    if (role !== this.activeModule) {
      this.error = `This account belongs to a ${role.toLowerCase()}. Please select the correct portal to login.`;
      this.authService.logout(); // log them out since they are in the wrong portal
      return;
    }
    
    if (role === 'INSTRUCTOR') {
      this.router.navigate(['/instructor']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}

