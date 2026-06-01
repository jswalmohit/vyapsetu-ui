import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardModule } from './dashboard.module';

describe('DashboardModule', () => {
  it('should compile the dashboard module', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, RouterTestingModule]
    }).compileComponents();

    expect(DashboardModule).toBeDefined();
  });
});
