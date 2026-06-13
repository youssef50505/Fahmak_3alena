import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { GamificationService } from '../../core/services/gamification.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, switchMap, filter } from 'rxjs';
import { GamificationProfile } from '../../core/models/gamification.model';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">My Achievements</h1>
          <p class="text-gray-500 mt-1">Track your progress and unlocked badges.</p>
        </div>
        <button routerLink="/dashboard" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          Back to Dashboard
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        @if (isLoading) {
          <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
        } @else if (!profile) {
          <div class="text-center py-12 text-gray-500">Failed to load gamification profile.</div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-6 border border-brand-100 flex flex-col items-center justify-center text-center">
              <span class="text-gray-500 font-bold mb-1 uppercase tracking-wider text-xs">Current Level</span>
              <span class="text-5xl font-black text-brand-600">{{ profile.level }}</span>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 flex flex-col items-center justify-center text-center">
              <span class="text-gray-500 font-bold mb-1 uppercase tracking-wider text-xs">Total XP</span>
              <span class="text-5xl font-black text-amber-500">{{ profile.totalXp }}</span>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100 flex flex-col items-center justify-center text-center">
              <span class="text-gray-500 font-bold mb-1 uppercase tracking-wider text-xs">Badges Unlocked</span>
              <span class="text-5xl font-black text-emerald-500">{{ profile.badges.length }}</span>
            </div>
          </div>

          <h3 class="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Unlocked Badges</h3>
          
          @if (profile.badges.length === 0) {
            <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
              You haven't unlocked any badges yet. Keep learning!
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              @for (badge of profile.badges; track badge.id) {
                <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-500 flex items-center justify-center mb-4 shadow-inner border border-orange-200">
                    <svg class="w-8 h-8 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path></svg>
                  </div>
                  <h4 class="font-bold text-gray-900 mb-1">{{ badge.name }}</h4>
                  <p class="text-xs text-gray-500">{{ badge.description }}</p>
                </div>
              }
            </div>
          }

          <div class="mt-12 animate-fade-in">
            <h3 class="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Brain Training (ألعاب التفكير)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <!-- Sudoku Game API -->
              <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Sudoku Challenge</h4>
                <p class="text-sm text-gray-500 mb-6">Complete the numbers in rows and columns. Powered by WebSudoku API.</p>
                <div class="w-full flex justify-center bg-gray-50 py-4 rounded-lg border border-gray-200 overflow-hidden">
                  <iframe src="https://widget.websudoku.com/?level=2" width="250" height="260" scrolling="no" frameborder="0" title="Sudoku Logic Game"></iframe>
                </div>
              </div>

              <!-- Jigsaw / Logic Puzzle API -->
              <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div class="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
                </div>
                <h4 class="font-bold text-gray-900 mb-2">Logic Puzzle</h4>
                <p class="text-sm text-gray-500 mb-6">Test your mental strength with an alternative puzzle challenge.</p>
                <div class="w-full flex justify-center bg-gray-50 py-4 rounded-lg border border-gray-200 overflow-hidden">
                   <iframe src="https://123sudoku.co.uk/sudokulib/generate.php?size=small" width="200" height="245" frameborder="0" scrolling="no" title="Alternative Logic Puzzle"></iframe>
                </div>
              </div>

            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AchievementsComponent implements OnInit, OnDestroy {
  profile: GamificationProfile | null = null;
  isLoading = true;
  private authSub?: Subscription;

  constructor(
    private gamificationService: GamificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authSub = this.authService.currentUser$.pipe(
      filter(user => !!user),
      switchMap((user: any) => {
        const userId = user.userId;
        return this.gamificationService.getUserProfile(userId);
      })
    ).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load gamification profile', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }
}
