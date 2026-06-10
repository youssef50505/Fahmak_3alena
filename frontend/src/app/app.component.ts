import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { HeaderComponent } from './shared/header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { PreferencesService } from './core/services/preferences.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fahmak-alena-frontend';

  constructor(
    public router: Router,
    private authService: AuthService,
    private preferencesService: PreferencesService
  ) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.preferencesService.loadPreferences();
      }
    });
  }

  isAuthRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl === '/' || cleanUrl === '' || cleanUrl.includes('/login') || cleanUrl.includes('/register');
  }
}
