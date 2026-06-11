import { Component, EventEmitter, Input, Output, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentProgress } from '../../../../core/models/instructor.model';
import gsap from 'gsap';

@Component({
  selector: 'app-student-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-profile-modal.component.html',
  styleUrl: './student-profile-modal.component.css'
})
export class StudentProfileModalComponent implements OnInit, AfterViewInit {
  @Input() student!: StudentProgress;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalBackdrop') modalBackdrop!: ElementRef;
  @ViewChild('modalContent') modalContent!: ElementRef;

  ngOnInit() {
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  ngAfterViewInit() {
    gsap.fromTo(this.modalBackdrop.nativeElement, 
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(this.modalContent.nativeElement, 
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  onClose() {
    gsap.to(this.modalContent.nativeElement, {
      opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: 'power2.in'
    });
    gsap.to(this.modalBackdrop.nativeElement, {
      opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: () => {
        document.body.style.overflow = '';
        this.close.emit();
      }
    });
  }
}
