import { routes } from './app.routes';

describe('app routes', () => {
  it('should include expected routes', () => {
    expect(routes).toBeDefined();
    expect(routes.some((route) => route.path === 'dashboard')).toBe(true);
    expect(routes.some((route) => route.path === 'products')).toBe(true);
    expect(routes.some((route) => route.path === 'customers')).toBe(true);
    expect(routes.some((route) => route.path === '**')).toBe(true);
  });
});
