import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, ActivatedRouteSnapshot, Router, RouterStateSnapshot, Route, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanMatch {
  constructor(private auth: AuthService, private router: Router) {}

  private checkLogin(): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin();
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    return this.checkLogin();
  }
}
