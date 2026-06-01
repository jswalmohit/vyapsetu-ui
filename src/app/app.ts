import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './shared/loader/loader.component';
import { LoadingService } from './services/loading.service';
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
  constructor(private loading: LoadingService) {
    // expose raw loading state for header debug indicator
    this.loading$ = this.loading.loading$;
  }
}
