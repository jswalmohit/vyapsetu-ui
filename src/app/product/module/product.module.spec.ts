import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductModule } from './product.module';

describe('ProductModule', () => {
  it('should compile the product module', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductModule, RouterTestingModule]
    }).compileComponents();

    expect(ProductModule).toBeDefined();
  });
});
