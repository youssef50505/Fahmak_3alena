import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImmersiveSession {
  modelName: string;
  aiScore: number;
  notesGenerated: number;
  currentTranscriptIndex: number;
}

export interface Peer {
  name: string;
  avatarUrl: string;
  level: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImmersiveHubService {
  private readonly API_URL = 'http://localhost:8080/api/immersive-hub';

  constructor(private http: HttpClient) {}

  getSession(): Observable<ImmersiveSession> {
    return this.http.get<ImmersiveSession>(`${this.API_URL}/session`);
  }

  generateNote(): Observable<ImmersiveSession> {
    return this.http.post<ImmersiveSession>(`${this.API_URL}/notes/generate`, {});
  }

  matchPeers(): Observable<Peer[]> {
    return this.http.post<Peer[]>(`${this.API_URL}/match-peers`, {});
  }
}
