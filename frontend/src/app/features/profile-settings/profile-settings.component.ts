import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/models/user.model';
import { gsap } from 'gsap';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit, AfterViewInit {
  @ViewChild('profileContainer', { static: true }) profileContainer!: ElementRef;
  @ViewChild('successMessage', { static: false }) successMessage!: ElementRef;

  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = true;
  isSaving = false;
  successText = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngAfterViewInit(): void {
    gsap.from(this.profileContainer.nativeElement.children, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }

  loadProfile(): void {
    this.userService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSaving = true;
    const updateReq = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value
    };

    this.userService.updateProfile(updateReq).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.showSuccess(res.message);
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.isSaving = false;
      }
    });
  }

  private showSuccess(message: string): void {
    this.successText = message;
    // Ensure view child is updated
    setTimeout(() => {
      if (this.successMessage) {
        gsap.fromTo(this.successMessage.nativeElement, 
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
        
        setTimeout(() => {
          gsap.to(this.successMessage.nativeElement, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => {
              this.successText = '';
            }
          });
        }, 3000);
      }
    }, 0);
  }
}
