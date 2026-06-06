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
      deleteProduct: vi.fn(),
      getLineItemsByProductId: vi.fn(),
      bulkCreateLineItems: vi.fn(),
      bulkUpdateLineItems: vi.fn(),
      bulkDeleteLineItems: vi.fn()
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

  it('should open line items modal and load items', () => {
    const product = { id: 10, productName: 'LProd', productId: 'LP10' };
    productService.getLineItemsByProductId = vi.fn().mockReturnValue(of({ success: true, data: [] }));
    vi.spyOn(component, 'loadLineItems');

    component.openLineItemsModal(product as any);

    expect(component.showLineItemsModal).toBe(true);
    expect(component.selectedProduct).toBe(product);
    expect(component.loadLineItems).toHaveBeenCalledWith('LP10');
  });

  it('should add a new line item and default GST to 18 and prevent duplicate unmodified temp rows', () => {
    component.selectedProduct = { productId: 'P1' } as any;
    component.lineItems = [];

    component.addLineItemRow();
    expect(component.lineItems.length).toBe(1);
    expect(component.lineItems[0].gst).toBe(18);

    // calling again without modifying should not add another temp row
    component.addLineItemRow();
    expect(component.lineItems.length).toBe(1);

    // modify the temp row
    const tmp = component.lineItems[0];
    component.onNumberInput({ target: { valueAsNumber: 5 } }, tmp, 'purchasePrice');
    expect(component.hasLineItemChanges()).toBe(true);

    // now adding should create another
    component.addLineItemRow();
    expect(component.lineItems.length).toBe(2);
  });

  it('should clamp numeric inputs to >= 0 and mark dirty', () => {
    component.selectedProduct = { productId: 'P2' } as any;
    component.lineItems = [];
    component.addLineItemRow();
    const r = component.lineItems[0];

    // simulate negative input
    component.onNumberInput({ target: { valueAsNumber: -10 } }, r, 'quantity');
    expect(r.quantity).toBe(0);
    expect(component.hasLineItemChanges()).toBe(true);
  });

  it('should call bulk create on save for new rows', () => {
    component.selectedProduct = { productId: 'P3' } as any;
    component.lineItems = [];
    component.addLineItemRow();
    const r = component.lineItems[0];
    component.onNumberInput({ target: { valueAsNumber: 50 } }, r, 'purchasePrice');
    component.onNumberInput({ target: { valueAsNumber: 2 } }, r, 'quantity');

    productService.bulkCreateLineItems.mockReturnValue(of({ success: true }));
    vi.spyOn(component, 'loadLineItems');

    component.saveLineItems();

    expect(productService.bulkCreateLineItems).toHaveBeenCalledWith([
      expect.objectContaining({
        productId: 'P3',
        purchasePrice: 50,
        gst: 18,
        quantity: 2
      })
    ]);
    expect(component.loadLineItems).toHaveBeenCalled();
  });

  it('should remove temporary line item row and delete existing rows correctly', () => {
    const tempRow = { id: 'tmp-1', productId: 'P4', purchasePrice: 0, gst: 18, quantity: 0, purchaseDate: component.today, sellerGSTIN: '', sellerName: '' };
    const existingRow = { id: 'uuid-1', productId: 'P4', purchasePrice: 10, gst: 18, quantity: 1, purchaseDate: component.today, sellerGSTIN: 'GST', sellerName: 'Seller' };
    component.lineItems = [tempRow, existingRow];
    component.lineItemsAdded.add(String(tempRow.id));

    component.removeLineItemRow(tempRow);
    expect(component.lineItems.find((i: any) => i.id === tempRow.id)).toBeUndefined();
    expect(component.lineItemsAdded.has(String(tempRow.id))).toBe(false);

    component.removeLineItemRow(existingRow);
    expect(component.lineItems.find((i: any) => i.id === existingRow.id)).toBeUndefined();
    expect(component.lineItemsDeleted.has(String(existingRow.id))).toBe(true);
  });

  it('should update edited sets and remove edit flag when item returns to original value', () => {
    const original = { id: 'uuid-2', productId: 'P5', purchasePrice: 10, gst: 18, quantity: 1, purchaseDate: '2026-06-02', sellerGSTIN: 'GST', sellerName: 'Seller' };
    component.lineItemsOriginal = [ { ...original } ];
    component.lineItems = [ { ...original } ];

    component.onLineItemChange(component.lineItems[0]);
    expect(component.lineItemsEdited.size).toBe(0);

    component.onNumberInput({ target: { valueAsNumber: 20 } }, component.lineItems[0], 'purchasePrice');
    expect(component.lineItemsEdited.has('uuid-2')).toBe(true);

    component.lineItems[0].purchasePrice = 10;
    component.onLineItemChange(component.lineItems[0]);
    expect(component.lineItemsEdited.has('uuid-2')).toBe(false);
  });

  it('should call bulk update and bulk delete on save for edited and deleted rows', () => {
    component.selectedProduct = { productId: 'P6' } as any;
    const editedRow = { id: 'uuid-3', productId: 'P6', purchasePrice: 10, gst: 18, quantity: 1, purchaseDate: component.today, sellerGSTIN: 'GST', sellerName: 'Seller' };
    const deletedId = 'uuid-4';
    component.lineItems = [editedRow];
    component.lineItemsEdited.add(String(editedRow.id));
    component.lineItemsDeleted.add(deletedId);

    productService.bulkUpdateLineItems.mockReturnValue(of({ success: true }));
    productService.bulkDeleteLineItems.mockReturnValue(of({ success: true }));
    vi.spyOn(component, 'loadLineItems');

    component.saveLineItems();

    expect(productService.bulkUpdateLineItems).toHaveBeenCalledWith([
      expect.objectContaining({ id: editedRow.id, purchasePrice: 10 })
    ]);
    expect(productService.bulkDeleteLineItems).toHaveBeenCalledWith([deletedId]);
    expect(component.loadLineItems).toHaveBeenCalled();
  });

  it('should clear line items and original state on load failure', () => {
    productService.getLineItemsByProductId.mockReturnValue(of({ success: false, data: null }));

    component.loadLineItems('P7');

    expect(component.lineItems).toEqual([]);
    expect(component.lineItemsOriginal).toEqual([]);
    expect(component.lineItemsDirty).toBe(false);
  });
});
