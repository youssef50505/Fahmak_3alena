import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { Course, CourseRequest } from '../../core/models/course.model';
import { gsap } from 'gsap';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('coursesGrid', { static: false }) coursesGrid!: ElementRef;
  @ViewChild('modalOverlay', { static: false }) modalOverlay!: ElementRef;
  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;

  courses: Course[] = [];
  isLoading = true;
  isModalOpen = false;
  isSaving = false;
  editingCourseId: number | null = null;
  courseForm: FormGroup;

  categories = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other'];
  difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(private courseService: CourseService, private fb: FormBuilder) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      difficultyLevel: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  ngAfterViewInit(): void {
    // Initial animations
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        // Instructor should only see their own, but since we use getAllCourses and don't have instructor id readily available,
        // we'll just display them. In a real app, we'd filter by instructor.
        this.courses = data;
        this.isLoading = false;
        this.animateGrid();
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.isLoading = false;
      }
    });
  }

  animateGrid(): void {
    setTimeout(() => {
      if (this.coursesGrid) {
        gsap.from(this.coursesGrid.nativeElement.children, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        });
      }
    }, 50);
  }

  openCreateModal(): void {
    this.editingCourseId = null;
    this.courseForm.reset({ price: 0 });
    this.showModal();
  }

  openEditModal(course: Course): void {
    this.editingCourseId = course.id;
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      category: course.category,
      difficultyLevel: course.difficultyLevel,
      price: course.price
    });
    this.showModal();
  }

  showModal(): void {
    this.isModalOpen = true;
    setTimeout(() => {
      gsap.to(this.modalOverlay.nativeElement, { opacity: 1, duration: 0.3 });
      gsap.fromTo(this.modalContent.nativeElement,
        { y: -50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }, 10);
  }

  closeModal(): void {
    gsap.to(this.modalOverlay.nativeElement, { opacity: 0, duration: 0.3 });
    gsap.to(this.modalContent.nativeElement, {
      y: 30, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        this.isModalOpen = false;
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) return;

    this.isSaving = true;
    const request: CourseRequest = this.courseForm.value;

    if (this.editingCourseId) {
      this.courseService.updateCourse(this.editingCourseId, request).subscribe({
        next: (updated) => {
          const idx = this.courses.findIndex(c => c.id === this.editingCourseId);
          if (idx !== -1) this.courses[idx] = updated;
          this.isSaving = false;
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to update', err);
          this.isSaving = false;
        }
      });
    } else {
      this.courseService.createCourse(request).subscribe({
        next: (created) => {
          this.courses.unshift(created);
          this.isSaving = false;
          this.closeModal();
          this.animateGrid(); // re-animate
        },
        error: (err) => {
          console.error('Failed to create', err);
          this.isSaving = false;
        }
      });
    }
  }

  deleteCourse(id: number, index: number, cardElement: HTMLElement): void {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      gsap.to(cardElement, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          this.courseService.deleteCourse(id).subscribe({
            next: () => {
              this.courses.splice(index, 1);
            },
            error: (err) => {
              console.error('Failed to delete', err);
              // Revert animation if failed
              gsap.to(cardElement, { scale: 1, opacity: 1, duration: 0.3 });
            }
          });
        }
      });
    }
  }
}
