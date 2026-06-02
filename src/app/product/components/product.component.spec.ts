import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductModule } from '../module/product.module';
import { ProductComponent } from './product.component';
import { ProductService } from '../services/product.service';
import { LoadingService } from '../../services/loading.service';

describe('ProductComponent', () => {
  let fixture: ComponentFixture<ProductComponent>;
  let component: ProductComponent;
  let productService: any;

  beforeEach(async () => {
    productService = {
      getProducts: vi.fn(),
      addProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn()
    };
    productService.getProducts.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProductModule, RouterTestingModule],
      providers: [
        { provide: ProductService, useValue: productService },
        LoadingService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter products based on search term', () => {
    component.products = [
      { id: 1, productName: 'Widget', productId: 'W1', costPrice: 100, gst: 5, quantity: 1, purchaseDate: '2026-06-02' },
      { id: 2, productName: 'Gadget', productId: 'G1', costPrice: 200, gst: 5, quantity: 1, purchaseDate: '2026-06-02' }
    ];
    component.onSearchChange('gad');

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].productName).toBe('Gadget');
  });

  it('should open add product modal and reset form state', () => {
    component.openAddProduct();

    expect(component.modalTitle).toBe('Add Product');
    expect(component.isEditMode).toBe(false);
    expect(component.showProductModal).toBe(true);
  });

  it('should open edit product modal with prefilled form', () => {
    const product = { id: 3, productName: 'Tool', productId: 'T3', costPrice: 50, gst: 12, quantity: 2, purchaseDate: '2026-06-02' };

    component.openEditProduct(product);

    expect(component.modalTitle).toBe('Edit Product');
    expect(component.isEditMode).toBe(true);
    expect(component.activeProductId).toBe(3);
    expect(component.productForm.get('productName')?.value).toBe('Tool');
    expect(component.showProductModal).toBe(true);
  });

  it('should not save product when form is invalid', () => {
    component.productForm.reset();

    component.saveProduct();

    expect(component.productForm.invalid).toBe(true);
    expect(productService.addProduct).not.toHaveBeenCalled();
  });

  it('should add new product and refresh list', () => {
    component.openAddProduct();
    component.productForm.setValue({ productName: 'New', productId: 'N1', costPrice: 10, gst: 5, quantity: 1, purchaseDate: '2026-06-02' });
    productService.addProduct.mockReturnValue(of({ id: 4, productName: 'New', productId: 'N1', costPrice: 10, gst: 5, quantity: 1, purchaseDate: '2026-06-02' }));
    vi.spyOn(component, 'loadProducts');

    component.saveProduct();

    expect(productService.addProduct).toHaveBeenCalled();
    expect(component.loadProducts).toHaveBeenCalled();
    expect(component.showProductModal).toBe(false);
  });

  it('should update product when edit mode is enabled', () => {
    component.openEditProduct({ id: 5, productName: 'Edit', productId: 'E5', costPrice: 15, gst: 5, quantity: 1, purchaseDate: '2026-06-02' });
    productService.updateProduct.mockReturnValue(of({ id: 5, productName: 'Edit', productId: 'E5', costPrice: 15, gst: 5, quantity: 1, purchaseDate: '2026-06-02' }));
    vi.spyOn(component, 'loadProducts');

    component.saveProduct();

    expect(productService.updateProduct).toHaveBeenCalledWith(5, expect.any(Object));
    expect(component.loadProducts).toHaveBeenCalled();
  });

  it('should confirm delete and remove the selected product', () => {
    const product = { id: 6, productName: 'Trash', productId: 'T6', costPrice: 20, gst: 5, quantity: 1, purchaseDate: '2026-06-02' };
    component.confirmDelete(product);

    expect(component.deleteTarget).toBe(product);
    expect(component.showDeleteModal).toBe(true);

    productService.deleteProduct.mockReturnValue(of(void 0));
    vi.spyOn(component, 'loadProducts');

    component.deleteProduct();

    expect(productService.deleteProduct).toHaveBeenCalledWith(6);
    expect(component.loadProducts).toHaveBeenCalled();
    expect(component.showDeleteModal).toBe(false);
  });
});
