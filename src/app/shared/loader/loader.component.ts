import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderComponent implements OnDestroy {
  // raw loading stream
  loading$: Observable<boolean>;

  // debounced visible state (shows after short delay, stays visible for min duration)
  visible$ = new BehaviorSubject<boolean>(false);
  private sub: Subscription | null = null;

  // timings (ms)
  private readonly SHOW_DELAY = 0; // show overlay immediately
  private readonly MIN_SHOW = 300; // keep overlay visible for at least 300ms

  constructor(private readonly loading: LoadingService) {
    this.loading$ = this.loading.loading$;

    // manage visible$ with simple timers so we avoid flicker
    let showTimer: any = null;
    let hideTimer: any = null;
    let currentlyVisible = false;

    this.sub = this.loading$.subscribe((isLoading) => {
      // start loading
      if (isLoading) {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        if (!currentlyVisible && !showTimer) {
          showTimer = setTimeout(() => {
            currentlyVisible = true;
            this.visible$.next(true);
            showTimer = null;
          }, this.SHOW_DELAY);
        }
      } else {
        // stop loading
        if (showTimer) {
          clearTimeout(showTimer);
          showTimer = null;
        }
        if (currentlyVisible) {
          // keep visible for MIN_SHOW then hide
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            currentlyVisible = false;
            this.visible$.next(false);
            hideTimer = null;
          }, this.MIN_SHOW);
        } else {
          // not visible yet — ensure we don't show
          this.visible$.next(false);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    this.visible$.complete();
  }
}
