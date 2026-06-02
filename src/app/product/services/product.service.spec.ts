import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductService } from '../services/product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.baseUrl}/api/Products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch products and map response data', () => {
    const response = { success: true, message: null, data: [{ id: 1, productName: 'Prod', productId: 'P1', costPrice: 10, gst: 5, quantity: 1, purchaseDate: '2026-06-02' }], errors: null };
    service.getProducts().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].productName).toBe('Prod');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should request a product by ID', () => {
    service.getProductById(2).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/2`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: null, data: { id: 2, productName: 'Prod', productId: 'P2', costPrice: 10, gst: 5, quantity: 1, purchaseDate: '2026-06-02' }, errors: null });
  });

  it('should add a new product', () => {
    const payload = { productName: 'New', productId: 'N1', costPrice: 20, gst: 5, quantity: 1, purchaseDate: '2026-06-02' };
    service.addProduct(payload).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3, ...payload });
  });

  it('should update a product', () => {
    const payload = { productName: 'Updated', productId: 'U1', costPrice: 30, gst: 5, quantity: 1, purchaseDate: '2026-06-02' };
    service.updateProduct(3, payload).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 3, ...payload });
  });

  it('should delete a product', () => {
    service.deleteProduct(4).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
