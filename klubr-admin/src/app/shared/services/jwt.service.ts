import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TOKEN_NAME } from '../utils/config/global-settings';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { AuthFacade } from "@app/routes/auth/data-access/+state/auth.facade";

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  private cookieService = inject(CookieService);
  private authFacade = inject(AuthFacade);

  saveToken(token: string): void {
    const decodedToken = this.getDecodedAccessToken(token);
    this.authFacade.setToken(token);
    this.cookieService.set(TOKEN_NAME, token, new Date(decodedToken.exp * 1000));
  }

  getCookieToken(): string | null {
    return this.cookieService.get(TOKEN_NAME);
  }

  hasCookieToken(): boolean {
    return this.cookieService.check(TOKEN_NAME);
  }

  removeToken(): void {
    this.authFacade.setToken(null);
    this.cookieService.deleteAll();
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (Error) {
      console.error('Error in decoding token', Error)
      return null;
    }

  }
}
