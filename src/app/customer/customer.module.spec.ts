import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomerModule } from './customer.module';

describe('CustomerModule', () => {
  it('should compile the customer module', async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerModule, RouterTestingModule]
    }).compileComponents();

    expect(CustomerModule).toBeDefined();
  });
});
