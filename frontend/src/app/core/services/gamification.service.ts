import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GamificationProfile } from '../models/gamification.model';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private apiUrl = 'http://localhost:8080/api/gamification';

  constructor(private http: HttpClient) {}

  getUserProfile(userId: number): Observable<GamificationProfile> {
    return this.http.get<GamificationProfile>(`${this.apiUrl}/users/${userId}/profile`);
  }

  awardXp(userId: number, activityType: string, xp: number): Observable<any> {
    const payload = { activityType, xp };
    return this.http.post(`${this.apiUrl}/users/${userId}/award`, payload);
  }

  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard`);
  }
}
