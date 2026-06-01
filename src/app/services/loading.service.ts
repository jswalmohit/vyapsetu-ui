import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  // action-specific trackers
  private actions = new Map<string, BehaviorSubject<boolean>>();

  startRequest(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) this.loadingSubject.next(true);
    // debug
    try { console.debug('[LoadingService] startRequest - count=', this.activeRequests); } catch {}
  }

  endRequest(): void {
    if (this.activeRequests > 0) this.activeRequests--;
    if (this.activeRequests === 0) this.loadingSubject.next(false);
    // debug
    try { console.debug('[LoadingService] endRequest - count=', this.activeRequests); } catch {}
  }

  // Action-level helpers
  markActionStart(key: string): void {
    let subj = this.actions.get(key);
    if (!subj) {
      subj = new BehaviorSubject<boolean>(false);
      this.actions.set(key, subj);
    }
    subj.next(true);
    this.startRequest();
    try { console.debug('[LoadingService] markActionStart', key); } catch {}
  }

  markActionEnd(key: string): void {
    const subj = this.actions.get(key);
    if (subj) subj.next(false);
    this.endRequest();
    try { console.debug('[LoadingService] markActionEnd', key); } catch {}
  }

  actionStatus$(key: string): Observable<boolean> {
    let subj = this.actions.get(key);
    if (!subj) {
      subj = new BehaviorSubject<boolean>(false);
      this.actions.set(key, subj);
    }
    return subj.asObservable();
  }

  // For debugging
  getActiveCount(): number {
    return this.activeRequests;
  }

  // Utility to track an observable under a key
  track<T>(obs$: Observable<T>, key?: string): Observable<T> {
    if (key) this.markActionStart(key);
    else this.startRequest();

    return obs$.pipe(
      finalize(() => {
        if (key) this.markActionEnd(key);
        else this.endRequest();
      })
    );
  }
}
