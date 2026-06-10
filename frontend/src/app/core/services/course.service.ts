import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {}

  getRecommendedCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/recommended`);
  }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  enrollInCourse(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/enroll`, {});
  }

  getMyEnrollments(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/my-enrollments`);
  }
}
