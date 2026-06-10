import { Injectable, NgZone } from '@angular/core';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class OAuthHelper {
  constructor(private ngZone: NgZone) {}

  initializeGoogleSignIn(clientId: string, callback: (response: any) => void) {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: any) => {
          this.ngZone.run(() => callback(res));
        }
      });
    }
  }

  renderGoogleButton(elementId: string) {
    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(
        document.getElementById(elementId),
        { theme: 'outline', size: 'large', type: 'standard', width: '100%' }
      );
    }
  }
}
