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

  initializeFacebookSignIn(appId: string) {
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId      : appId,
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0'
      });
      (window as any).FB.AppEvents.logPageView();
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s) as HTMLScriptElement; js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if (fjs && fjs.parentNode) {
         fjs.parentNode.insertBefore(js, fjs);
       } else {
         d.head.appendChild(js);
       }
     }(document, 'script', 'facebook-jssdk'));
  }

  loginWithFacebook(callback: (response: any) => void) {
    if ((window as any).FB) {
      (window as any).FB.login((response: any) => {
        this.ngZone.run(() => callback(response));
      }, {scope: 'public_profile,email'});
    } else {
      console.error('Facebook SDK not loaded');
      this.ngZone.run(() => callback({ error: 'Facebook SDK not loaded' }));
    }
  }
}
