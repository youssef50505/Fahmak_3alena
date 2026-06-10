import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructorService } from '../../core/services/instructor.service';
import { InstructorDashboardResponse } from '../../core/models/instructor.model';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.css'
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  dashboardData: InstructorDashboardResponse | null = null;
  isLoading = true;
  userName = '';
  pendingAssignments = Math.floor(Math.random() * 30) + 5;
  newDiscussions = Math.floor(Math.random() * 20) + 2;
  suspiciousSessions = 0;
  liveSession1Joined = Math.floor(Math.random() * 100) + 20;
  liveSession2Joined = Math.floor(Math.random() * 100) + 50;
  private authSub?: Subscription;

  constructor(
    private instructorService: InstructorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        const u = user.user || user;
        this.userName = `${u.firstName} ${u.lastName}`;
      }
    });

    this.instructorService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        if (data.flaggedSessionCount !== undefined) {
          this.suspiciousSessions = data.flaggedSessionCount;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching instructor dashboard data', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
