import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { LoadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('LoadingInterceptor', () => {
  let loadingService: LoadingService;
  let interceptor: LoadingInterceptor;

  beforeEach(() => {
    loadingService = new LoadingService();
    interceptor = new LoadingInterceptor(loadingService);
  });

  it('should start and end loading around the HTTP request', () => {
    const startSpy = vi.spyOn(loadingService, 'startRequest');
    const endSpy = vi.spyOn(loadingService, 'endRequest');

    const request = new HttpRequest('GET', '/test');
    const handler: HttpHandler = {
      handle: vi.fn().mockReturnValue(of({} as HttpEvent<unknown>))
    } as unknown as HttpHandler;

    interceptor.intercept(request, handler).subscribe();

    expect(handler.handle).toHaveBeenCalledWith(request);
    expect(startSpy).toHaveBeenCalled();
    expect(endSpy).toHaveBeenCalled();
  });
});
