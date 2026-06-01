import { vi } from 'vitest';
import { LoaderComponent } from './loader.component';
import { LoadingService } from '../../services/loading.service';

describe('LoaderComponent', () => {
  let service: LoadingService;
  let component: LoaderComponent;

  beforeEach(() => {
    service = new LoadingService();
    component = new LoaderComponent(service);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show and hide visible state with minimum duration', () => {
    vi.useFakeTimers();
    service.startRequest();
    vi.advanceTimersByTime(0);
    expect(component.visible$.value).toBe(true);

    service.endRequest();
    vi.advanceTimersByTime(299);
    expect(component.visible$.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(component.visible$.value).toBe(false);
    vi.useRealTimers();
  });

  it('should clean up subscription on destroy', () => {
    const unsubscribeSpy = vi.spyOn(component['sub']!, 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
