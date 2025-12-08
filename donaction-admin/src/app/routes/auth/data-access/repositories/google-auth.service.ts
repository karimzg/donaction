import { Injectable } from '@angular/core';
// import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
// import { AuthFacade } from '../../data-access/+state/auth.facade';

@Injectable()
export class GoogleAuthService {
  // private authSocialService = inject(SocialAuthService);
  // private authFacade = inject(AuthFacade);

  constructor() {
    // 2025 01: remove as not used. NextJs token used for auth.
    //this.initializeSocialLogin();
  }

  // private initializeSocialLogin(): void {
  //   this.authSocialService.authState.pipe(take(1)).subscribe({
  //     next: (user: SocialUser) => {
  //       user && this.handleSocialLogin(user)
  //     },
  //     error: (error) => console.error('Error during social login:', error),
  //   });
  // }

  // private handleSocialLogin(user: SocialUser): void {
  //   this.authSocialService.getAccessToken(GoogleLoginProvider.PROVIDER_ID)
  //     .then(data => this.authFacade.googleOAuthRegister(user.provider.toLowerCase(), data))
  //     .catch(error => console.error("Error retrieving access token:", error));
  // }

}
