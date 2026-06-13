import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GamificationService } from '../../core/services/gamification.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, switchMap, filter } from 'rxjs';
import { GamificationProfile } from '../../core/models/gamification.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-8 pb-12 font-sans animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-end mb-8">
        <div>
          <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 tracking-tight">
            My Achievements
          </h1>
          <p class="text-gray-500 mt-2 font-medium">Track your progress, unlocked badges, and challenge your brain.</p>
        </div>
        <button routerLink="/dashboard" class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-semibold hover:shadow-md">
          Back to Dashboard
        </button>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40">
        @if (isLoading) {
          <div class="flex justify-center py-16"><div class="animate-spin rounded-full h-10 w-10 border-b-4 border-brand-600"></div></div>
        } @else if (!profile) {
          <div class="text-center py-16 text-gray-500 font-medium">Failed to load gamification profile.</div>
        } @else {
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-2xl p-8 border border-brand-100/50 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <span class="text-brand-600/80 font-bold mb-2 uppercase tracking-widest text-xs">Current Level</span>
              <span class="text-6xl font-black text-brand-600 drop-shadow-sm">{{ profile.level }}</span>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100/50 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <span class="text-orange-600/80 font-bold mb-2 uppercase tracking-widest text-xs">Total XP</span>
              <span class="text-6xl font-black text-amber-500 drop-shadow-sm">{{ profile.totalXp }}</span>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100/50 flex flex-col items-center justify-center text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <span class="text-emerald-600/80 font-bold mb-2 uppercase tracking-widest text-xs">Badges Unlocked</span>
              <span class="text-6xl font-black text-emerald-500 drop-shadow-sm">{{ profile.badges.length || 0 }}</span>
            </div>
          </div>

          <!-- Badges Section -->
          <h3 class="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Unlocked Badges</h3>
          
          @if (!profile.badges || profile.badges.length === 0) {
            <div class="bg-gray-50 text-gray-500 rounded-xl p-8 text-center border border-gray-100 border-dashed">
              <div class="text-4xl mb-3 opacity-50">🏆</div>You haven't unlocked any badges yet. Keep learning!
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              @for (badge of profile.badges; track badge.id) {
                <div class="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all hover:-translate-y-1">
                  <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-500 flex items-center justify-center mb-5 shadow-inner border border-orange-200 rotate-3">
                    <svg class="w-10 h-10 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path></svg>
                  </div>
                  <h4 class="font-extrabold text-gray-900 mb-2">{{ badge.name }}</h4>
                  <p class="text-sm text-gray-500 leading-relaxed">{{ badge.description }}</p>
                </div>
              }
            </div>
          }

          <!-- Embedded API Games Section -->
          <div class="mt-16">
            <div class="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
              <div class="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-900">Brain Training APIs</h3>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <!-- 2048 CrazyGames API -->
              <div class="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border-4 border-gray-800 transform transition-all hover:-translate-y-1">
                <div class="bg-gray-800 px-6 py-4 flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <h4 class="text-gray-100 font-bold tracking-wider text-sm">2048 PUZZLE</h4>
                </div>
                <div class="w-full h-[450px] bg-gray-50">
                  <iframe [src]="game1Url" class="w-full h-full border-0" allow="gamepad *;"></iframe>
                </div>
              </div>

              <!-- Chess Puzzle Lichess API -->
              <div class="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border-4 border-gray-800 transform transition-all hover:-translate-y-1">
                <div class="bg-gray-800 px-6 py-4 flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <h4 class="text-gray-100 font-bold tracking-wider text-sm">CHESS TRAINING</h4>
                </div>
                <div class="w-full h-[450px] bg-gray-50">
                  <iframe [src]="game2Url" class="w-full h-full border-0"></iframe>
                </div>
              </div>

            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AchievementsComponent implements OnInit, OnDestroy {
  profile: GamificationProfile | null = null;
  isLoading = true;
  private authSub?: Subscription;

  game1Url: SafeResourceUrl;
  game2Url: SafeResourceUrl;

  constructor(
    private gamificationService: GamificationService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.game1Url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.crazygames.com/embed/2048');
    this.game2Url = this.sanitizer.bypassSecurityTrustResourceUrl('https://lichess.org/training/frame?theme=brown&bg=light');
  }

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
