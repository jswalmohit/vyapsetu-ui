import { appConfig } from './app.config';

describe('appConfig', () => {
  it('should define providers for the application configuration', () => {
    expect(appConfig).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });
});
