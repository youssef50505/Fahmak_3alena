import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { OAuthHelper } from '../../../core/services/oauth.helper';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let oauthHelperSpy: jasmine.SpyObj<OAuthHelper>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'loginWithGoogle']);
    oauthHelperSpy = jasmine.createSpyObj('OAuthHelper', ['initializeGoogleSignIn', 'renderGoogleButton']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: OAuthHelper, useValue: oauthHelperSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.value).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'STUDENT',
      agreeTerms: false
    });
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should invalidate form if fields are missing or invalid', () => {
    let email = component.registerForm.controls['email'];
    email.setValue('invalid-email');
    expect(email.errors?.['email']).toBeTruthy();

    let password = component.registerForm.controls['password'];
    password.setValue('short');
    expect(password.errors?.['minlength']).toBeTruthy();

    let agreeTerms = component.registerForm.controls['agreeTerms'];
    expect(agreeTerms.errors?.['required']).toBeTruthy();
  });

  it('should validate form if fields are correct', () => {
    component.registerForm.controls['firstName'].setValue('John');
    component.registerForm.controls['lastName'].setValue('Doe');
    component.registerForm.controls['email'].setValue('john@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['role'].setValue('STUDENT');
    component.registerForm.controls['agreeTerms'].setValue(true);
    expect(component.registerForm.valid).toBeTrue();
  });

  it('should mark all fields as touched if form is invalid on submit', () => {
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.registerForm.controls['email'].touched).toBeTrue();
    expect(component.registerForm.controls['password'].touched).toBeTrue();
  });

  it('should show loading and call register on valid submit with auto-login', () => {
    component.registerForm.controls['firstName'].setValue('John');
    component.registerForm.controls['lastName'].setValue('Doe');
    component.registerForm.controls['email'].setValue('john@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['role'].setValue('STUDENT');
    component.registerForm.controls['agreeTerms'].setValue(true);

    authServiceSpy.register.and.returnValue(of({ token: '123', user: { role: 'STUDENT' } }));

    component.onSubmit();

    expect(component.isLoading).toBeFalse();
    expect(authServiceSpy.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'password123',
      role: 'STUDENT'
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should route to login if registration succeeds but no auto-login token is provided', () => {
    component.registerForm.controls['firstName'].setValue('John');
    component.registerForm.controls['lastName'].setValue('Doe');
    component.registerForm.controls['email'].setValue('john@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['role'].setValue('STUDENT');
    component.registerForm.controls['agreeTerms'].setValue(true);

    authServiceSpy.register.and.returnValue(of({ message: 'Success' }));

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { registered: 'true' } });
  });

  it('should handle backend connection error (status 0)', () => {
    component.registerForm.controls['firstName'].setValue('John');
    component.registerForm.controls['lastName'].setValue('Doe');
    component.registerForm.controls['email'].setValue('john@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['role'].setValue('STUDENT');
    component.registerForm.controls['agreeTerms'].setValue(true);

    authServiceSpy.register.and.returnValue(throwError(() => ({ status: 0 })));

    component.onSubmit();

    expect(component.error).toEqual('Unable to connect to the server. Is the backend running?');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle registration error', () => {
    component.registerForm.controls['firstName'].setValue('John');
    component.registerForm.controls['lastName'].setValue('Doe');
    component.registerForm.controls['email'].setValue('john@test.com');
    component.registerForm.controls['password'].setValue('password123');
    component.registerForm.controls['role'].setValue('STUDENT');
    component.registerForm.controls['agreeTerms'].setValue(true);

    authServiceSpy.register.and.returnValue(throwError(() => ({ error: { message: 'Email already exists' } })));

    component.onSubmit();

    expect(component.error).toEqual('Email already exists');
    expect(component.isLoading).toBeFalse();
  });

  it('should initialize google sign in after view init', () => {
    component.ngAfterViewInit();
    expect(oauthHelperSpy.initializeGoogleSignIn).toHaveBeenCalled();
    expect(oauthHelperSpy.renderGoogleButton).toHaveBeenCalledWith('google-btn-register');
  });

  it('should handle google login successfully', () => {
    authServiceSpy.loginWithGoogle.and.returnValue(of({ token: '123', user: { role: 'INSTRUCTOR' } }));
    
    component.handleGoogleLogin('google-token');

    expect(authServiceSpy.loginWithGoogle).toHaveBeenCalledWith('google-token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/instructor']);
  });

  it('should set active module and update form role', () => {
    component.setModule('ADMIN');
    expect(component.activeModule).toEqual('ADMIN');
    expect(component.registerForm.controls['role'].value).toEqual('ADMIN');
  });
});
