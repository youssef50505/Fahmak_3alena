import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = authService.getToken();
  if (!token) {
    return router.parseUrl('/login');
  }

  // Check if token is expired by decoding the JWT payload
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationMs = payload.exp * 1000;
    if (Date.now() >= expirationMs) {
      // Token expired — force logout and redirect
      authService.logout();
      return router.parseUrl('/login');
    }
  } catch (e) {
    // Malformed token — force logout
    authService.logout();
    return router.parseUrl('/login');
  }

  return true;
};
