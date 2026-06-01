import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardRoutingModule } from './dashboard-routing.module';

describe('DashboardRoutingModule', () => {
  it('should compile routing module', async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardRoutingModule, RouterTestingModule]
    }).compileComponents();

    expect(DashboardRoutingModule).toBeDefined();
  });
});
