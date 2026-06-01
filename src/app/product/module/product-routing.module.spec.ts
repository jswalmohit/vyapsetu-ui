import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductRoutingModule } from './product-routing.module';

describe('ProductRoutingModule', () => {
  it('should compile product routing module', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRoutingModule, RouterTestingModule]
    }).compileComponents();

    expect(ProductRoutingModule).toBeDefined();
  });
});
