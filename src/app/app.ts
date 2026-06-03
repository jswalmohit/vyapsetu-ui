import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './shared/loader/loader.component';
import { LoadingService } from './services/loading.service';
import { AuthService } from './auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, LoaderComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('vyapsetu-ui');
  loading$: Observable<boolean>;
  isAuthenticated$: Observable<boolean>;

  constructor(
    private loading: LoadingService,
    private auth: AuthService,
    private router: Router
  ) {
    this.loading$ = this.loading.loading$;
    this.isAuthenticated$ = this.auth.isAuthenticated$;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
