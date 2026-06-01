import { of } from 'rxjs';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('should start and end a global request', () => {
    expect(service.getActiveCount()).toBe(0);
    service.startRequest();
    expect(service.getActiveCount()).toBe(1);
    service.endRequest();
    expect(service.getActiveCount()).toBe(0);
  });

  it('should track observable lifecycle and update loading state', () => {
    const states: boolean[] = [];
    service.loading$.subscribe((value) => states.push(value));

    service.track(of('done')).subscribe();

    expect(states).toEqual([false, true, false]);
  });

  it('should manage action status observables', () => {
    const activity: boolean[] = [];
    service.actionStatus$('fetchCustomer').subscribe((value) => activity.push(value));

    service.markActionStart('fetchCustomer');
    service.markActionEnd('fetchCustomer');

    expect(activity).toEqual([false, true, false]);
  });
});
