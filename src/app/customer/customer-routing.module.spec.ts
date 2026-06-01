import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomerRoutingModule } from './customer-routing.module';

describe('CustomerRoutingModule', () => {
  it('should compile customer routing module', async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRoutingModule, RouterTestingModule]
    }).compileComponents();

    expect(CustomerRoutingModule).toBeDefined();
  });
});
