import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { OAuthHelper } from '../../../core/services/oauth.helper';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let oauthHelperSpy: jasmine.SpyObj<OAuthHelper>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'loginWithGoogle']);
    oauthHelperSpy = jasmine.createSpyObj('OAuthHelper', ['initializeGoogleSignIn', 'renderGoogleButton']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthHelper, useValue: oauthHelperSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should invalidate form if email is missing or malformed', () => {
    let email = component.loginForm.controls['email'];
    expect(email.valid).toBeFalsy();
    expect(email.errors?.['required']).toBeTruthy();
    
    email.setValue('invalid-email');
    expect(email.errors?.['email']).toBeTruthy();

    email.setValue('test@test.com');
    expect(email.errors).toBeNull();
  });

  it('should validate form if fields are correct', () => {
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('password123');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should show loading and call login on valid submit', () => {
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('password123');
    authServiceSpy.login.and.returnValue(of({ token: '123', user: { role: 'STUDENT' } }));

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle backend connection error (status 0)', () => {
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('password123');
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 0 })));

    component.onSubmit();

    expect(component.error).toEqual('Unable to connect to the server. Is the backend running?');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle invalid credentials error', () => {
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('password123');
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));

    component.onSubmit();

    expect(component.error).toEqual('Invalid credentials');
    expect(component.isLoading).toBeFalse();
  });

  it('should initialize google sign in after view init', () => {
    component.ngAfterViewInit();
    expect(oauthHelperSpy.initializeGoogleSignIn).toHaveBeenCalled();
    expect(oauthHelperSpy.renderGoogleButton).toHaveBeenCalledWith('google-btn-login');
  });

  it('should handle google login successfully', () => {
    authServiceSpy.loginWithGoogle.and.returnValue(of({ token: '123', user: { role: 'INSTRUCTOR' } }));
    
    component.handleGoogleLogin('google-token');

    expect(authServiceSpy.loginWithGoogle).toHaveBeenCalledWith('google-token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor']);
  });

  it('should handle admin routing', () => {
    component.loginForm.controls['email'].setValue('test@test.com');
    component.loginForm.controls['password'].setValue('password123');
    authServiceSpy.login.and.returnValue(of({ token: '123', user: { role: 'ADMIN' } }));

    component.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });
  

});
