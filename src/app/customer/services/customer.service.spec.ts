import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../../environments/environment';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.baseUrl}/api/customers`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService]
    });

    service = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request customer by phone', () => {
    service.getCustomerByPhone('1234567890').subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}/GetCustomerByPhone` && request.method === 'GET');
    expect(req.request.params.get('phoneNumber')).toBe('1234567890');
    req.flush({ count: 0, customers: [] });
  });

  it('should create a new customer', () => {
    const payload = { customerName: 'Gina', phoneNumber: '1234567890' };
    service.createCustomer(payload).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/CreateCustomer`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, customerName: 'Gina', mobile: '1234567890', address: '' });
  });

  it('should update an existing customer', () => {
    const payload = { name: 'Hank', mobile: '2223334444', address: 'Home' };
    service.updateCustomer(5, payload).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 5, ...payload });
  });

  it('should delete a customer', () => {
    service.deleteCustomer(6).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/6`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
